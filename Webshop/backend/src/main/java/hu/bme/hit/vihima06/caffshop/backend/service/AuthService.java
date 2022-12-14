package hu.bme.hit.vihima06.caffshop.backend.service;

import hu.bme.hit.vihima06.caffshop.backend.controller.exceptions.BadRequestException;
import hu.bme.hit.vihima06.caffshop.backend.controller.exceptions.InternalServerErrorException;
import hu.bme.hit.vihima06.caffshop.backend.controller.exceptions.NotFoundException;
import hu.bme.hit.vihima06.caffshop.backend.controller.exceptions.UnauthorizedException;
import hu.bme.hit.vihima06.caffshop.backend.mapper.UserMapper;
import hu.bme.hit.vihima06.caffshop.backend.model.ERole;
import hu.bme.hit.vihima06.caffshop.backend.model.RefreshToken;
import hu.bme.hit.vihima06.caffshop.backend.model.Role;
import hu.bme.hit.vihima06.caffshop.backend.model.User;
import hu.bme.hit.vihima06.caffshop.backend.models.LoginRequest;
import hu.bme.hit.vihima06.caffshop.backend.models.LoginResponse;
import hu.bme.hit.vihima06.caffshop.backend.models.NewTokenResponse;
import hu.bme.hit.vihima06.caffshop.backend.models.RegistrationRequest;
import hu.bme.hit.vihima06.caffshop.backend.repository.RefreshTokenRepository;
import hu.bme.hit.vihima06.caffshop.backend.repository.RoleRepository;
import hu.bme.hit.vihima06.caffshop.backend.repository.UserRepository;
import hu.bme.hit.vihima06.caffshop.backend.security.jwt.JwtUtils;
import hu.bme.hit.vihima06.caffshop.backend.security.service.UserDetailsImpl;
import hu.bme.hit.vihima06.caffshop.backend.service.util.EmailValidator;
import hu.bme.hit.vihima06.caffshop.backend.service.util.UserValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.codec.Hex;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
@EnableScheduling
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final RefreshTokenRepository refreshTokenRepository;

    final
    JwtUtils jwtUtils;

    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, RoleRepository roleRepository, RefreshTokenRepository refreshTokenRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        logger.info("Initialized");
    }

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername().toLowerCase().trim(), loginRequest.getPassword()));
        } catch (AuthenticationException e) {
            logger.error("Login failed with username {}", loginRequest.getUsername());
            throw new UnauthorizedException("User not found");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails =  (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(userDetails);
        String refreshJwt = jwtUtils.generateJwtRefreshToken(userDetails);

        Integer userId = ((UserDetailsImpl) authentication.getPrincipal()).getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Login failed: user not found by id: {}", userId);
                    return new NotFoundException("User not found");
                });

        saveRefreshToken(refreshJwt, user);

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setUserDetails(UserMapper.INSTANCE.userToUserDetailsResponse(user));
        loginResponse.setAccessToken(jwt);
        loginResponse.setRefreshToken(refreshJwt);

        logger.info("User {} logged in successfully", user.getUsername());

        return loginResponse;
    }

    @Transactional
    public NewTokenResponse refreshLogin(String refreshToken) {
        if (!jwtUtils.validateJwtRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Wrong refresh token");
        }

        String hashOfJwtToken = getHashOfJwtToken(refreshToken);
        Integer userId = jwtUtils.getRefreshTokenUserId(refreshToken);
        Optional<RefreshToken> storedToken = refreshTokenRepository.findFirstByTokenHashAndUserId(hashOfJwtToken, userId);

        if (storedToken.isEmpty()) {
            logger.error("Refresh token not found for user id {}", userId);
            throw new UnauthorizedException("Wrong refresh token");
        }

        refreshTokenRepository.deleteAllByTokenHash(storedToken.get().getTokenHash());

        String username = jwtUtils.getUsernameFromJwtRefreshToken(refreshToken);

        User user = userRepository.findByUsername(username).orElseThrow(() -> {
            logger.error("Token refresh failed: user not found by username: {}", username);
            return new UnauthorizedException("User not found");
        });

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        String jwt = jwtUtils.generateJwtToken(userDetails);
        String refreshJwt = jwtUtils.generateJwtRefreshToken(userDetails);

        NewTokenResponse newTokenResponse = new NewTokenResponse();
        newTokenResponse.setAccessToken(jwt);
        newTokenResponse.setRefreshToken(refreshJwt);

        saveRefreshToken(refreshJwt, user);

        logger.info("User {} token refreshed successfully", user.getUsername());

        return newTokenResponse;
    }

    @Transactional
    public void register(RegistrationRequest registrationRequest) {
        String email = registrationRequest.getEmail().toLowerCase();

        if (!UserValidator.validateName(registrationRequest.getName())) {
            throw new BadRequestException("Error: Name should be at least 4 characters long!");
        }

        if (!UserValidator.validateUsername(registrationRequest.getUsername())) {
            throw new BadRequestException("Error: Username should be at least 4 characters long!");
        }

        if (!EmailValidator.validateEmail(email)) {
            throw new BadRequestException("Error: Email is invalid!");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already in use!");
        }

        if (registrationRequest.getPassword().length() < 8) {
            throw new BadRequestException("Error: Password should be at least 8 character!");
        }

        if (!registrationRequest.getPassword().equals(registrationRequest.getConfirmPassword())) {
            throw new BadRequestException("Error: Passwords not match!");
        }

        Set<Role> roles = new HashSet<>();

        Optional<Role> role = roleRepository.findByName(ERole.ROLE_USER);

        if (role.isEmpty()) {
            logger.info("No roles, creating them now");
            roleRepository.saveAllAndFlush(List.of(new Role(ERole.ROLE_ADMIN), new Role(ERole.ROLE_USER)));
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> {
                        logger.error("Role {} not found duing registration", ERole.ROLE_ADMIN);
                        return new InternalServerErrorException("Error: Role is not found.");
                    }));
            logger.info("Role {} added to new user {}", ERole.ROLE_ADMIN, registrationRequest.getUsername());
        }

        roles.add(roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> {
                    logger.error("Role {} not found duing registration", ERole.ROLE_USER);
                    return new InternalServerErrorException("Error: Role is not found.");
                }));

        User user = new User(
                registrationRequest.getName().trim(),
                registrationRequest.getUsername().trim(),
                email,
                passwordEncoder.encode(registrationRequest.getPassword()),
                roles
        );

        logger.info("User {} registered successfully", registrationRequest.getUsername());

        userRepository.save(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteAllByTokenHash(getHashOfJwtToken(refreshToken));
    }

    private void saveRefreshToken(String token, User user) {
        String tokenHash = getHashOfJwtToken(token);
        Date expiration = jwtUtils.getRefreshTokenExpiration(token);
        refreshTokenRepository.save(new RefreshToken(tokenHash, expiration, user));
    }

    private String getHashOfJwtToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return String.copyValueOf(Hex.encode(hash));
        } catch (NoSuchAlgorithmException e) {
            logger.error(e.getMessage());
            e.printStackTrace();
            throw new InternalServerErrorException(e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 3 * * *", zone = "Europe/Budapest")
    protected void clearExpiredRefreshTokens() {
        logger.info("Deleting expired refrest tokens");
        List<RefreshToken> expired = refreshTokenRepository.findByExpirationLessThan(new Date());
        refreshTokenRepository.deleteAllInBatch(expired);
        logger.info("Deleted {} refresh tokens", expired.size());
    }
}
