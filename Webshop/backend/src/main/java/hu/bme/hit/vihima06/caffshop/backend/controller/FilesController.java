package hu.bme.hit.vihima06.caffshop.backend.controller;

import hu.bme.hit.vihima06.caffshop.backend.api.FilesApi;
import hu.bme.hit.vihima06.caffshop.backend.controller.exceptions.NotFoundException;
import hu.bme.hit.vihima06.caffshop.backend.models.*;
import hu.bme.hit.vihima06.caffshop.backend.service.CaffFileDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

@RestController
public class FilesController implements FilesApi {

    @Autowired
    private CaffFileDataService fileService;

    @Override
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFilesDelete(Integer id) {
        fileService.deleteById(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Override
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CaffDetailsResponse> getFileDetails(Integer id) {
        CaffDetailsResponse fileDetails = fileService.getFileDetailsById(id);

        return new ResponseEntity<>(fileDetails, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Resource> getFilesDownload(Integer id) {
        File file;

        try {
            file = ResourceUtils.getFile("classpath:test.caff");
        } catch (FileNotFoundException e) {
            throw new NotFoundException("File not found");
        }

        HttpHeaders respHeaders = new HttpHeaders();
        respHeaders.setContentLength(file.length());
        respHeaders.setContentDispositionFormData("attachment", "test.caff");

        return new ResponseEntity<>(
                new FileSystemResource(file), respHeaders, HttpStatus.OK
        );
    }

    @Override
    public ResponseEntity<Resource> getFilesPreview(Integer id) {
        File file;

        try {
            file = ResourceUtils.getFile("classpath:bmp_24.bmp");
        } catch (FileNotFoundException e) {
            throw new NotFoundException("File not found");
        }

        HttpHeaders respHeaders = new HttpHeaders();
        respHeaders.setContentLength(file.length());
        respHeaders.setContentDispositionFormData("attachment", "preview.bmp");

        return new ResponseEntity<>(
                new FileSystemResource(file), respHeaders, HttpStatus.OK
        );
    }

    @Override
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CaffResponse>> getFilesSearch(String query) {
        List<CaffResponse> files = fileService.searchCaffFiles(query);

        return new ResponseEntity<>(files, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<CommentResponse> postFilesCommentFileId(Integer fileId, CommentRequest body) {
        return null;
    }

    @Override
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CaffDetailsResponse> postFilesModifyId(Integer id, ModifyCaffRequest body) {
        CaffDetailsResponse file = fileService.modifyFile(id, body);

        return new ResponseEntity<>(file, HttpStatus.ACCEPTED);
    }

    @Override
    public ResponseEntity<FileUploadResponse> postFilesUpload(String name, Double price, MultipartFile file) {
        try {
            File uploadfile = new File(
                    ResourceUtils.getFile("classpath:").getCanonicalPath()
                            + "/"
                            + file.getOriginalFilename()
            );
            file.transferTo(uploadfile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return new ResponseEntity<>(new FileUploadResponse().id(42), HttpStatus.CREATED);
    }

}
