/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpContext } from '@angular/common/http';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';
import { RequestBuilder } from '../request-builder';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { CaffDetailsResponse } from '../models/caff-details-response';
import { CaffResponse } from '../models/caff-response';
import { CommentRequest } from '../models/comment-request';
import { CommentResponse } from '../models/comment-response';
import { FileUploadRequest } from '../models/file-upload-request';
import { FileUploadResponse } from '../models/file-upload-response';
import { ModifyCaffRequest } from '../models/modify-caff-request';

@Injectable({
  providedIn: 'root',
})
export class FilesService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Path part for operation getFilesSearch
   */
  static readonly GetFilesSearchPath = '/files/search';

  /**
   * Your GET endpoint.
   *
   * search for caff files
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFilesSearch()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFilesSearch$Response(params?: {
    query?: string;
    context?: HttpContext
  }
): Observable<StrictHttpResponse<Array<CaffResponse>>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.GetFilesSearchPath, 'get');
    if (params) {
      rb.query('query', params.query, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Array<CaffResponse>>;
      })
    );
  }

  /**
   * Your GET endpoint.
   *
   * search for caff files
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getFilesSearch$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFilesSearch(params?: {
    query?: string;
    context?: HttpContext
  }
): Observable<Array<CaffResponse>> {

    return this.getFilesSearch$Response(params).pipe(
      map((r: StrictHttpResponse<Array<CaffResponse>>) => r.body as Array<CaffResponse>)
    );
  }

  /**
   * Path part for operation deleteFilesDelete
   */
  static readonly DeleteFilesDeletePath = '/files/delete/{id}';

  /**
   * delete an uploaded caff file
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteFilesDelete()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteFilesDelete$Response(params: {
    id: number;
    context?: HttpContext
  }
): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.DeleteFilesDeletePath, 'delete');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * delete an uploaded caff file
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `deleteFilesDelete$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteFilesDelete(params: {
    id: number;
    context?: HttpContext
  }
): Observable<void> {

    return this.deleteFilesDelete$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

  /**
   * Path part for operation postFilesCommentFileId
   */
  static readonly PostFilesCommentFileIdPath = '/files/comment/{fileId}';

  /**
   * create a new coment on a file
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `postFilesCommentFileId()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  postFilesCommentFileId$Response(params: {
    fileId: number;
    context?: HttpContext
    body?: CommentRequest
  }
): Observable<StrictHttpResponse<CommentResponse>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.PostFilesCommentFileIdPath, 'post');
    if (params) {
      rb.path('fileId', params.fileId, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<CommentResponse>;
      })
    );
  }

  /**
   * create a new coment on a file
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `postFilesCommentFileId$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  postFilesCommentFileId(params: {
    fileId: number;
    context?: HttpContext
    body?: CommentRequest
  }
): Observable<CommentResponse> {

    return this.postFilesCommentFileId$Response(params).pipe(
      map((r: StrictHttpResponse<CommentResponse>) => r.body as CommentResponse)
    );
  }

  /**
   * Path part for operation getFileDetails
   */
  static readonly GetFileDetailsPath = '/files/details/{id}';

  /**
   * Your GET endpoint.
   *
   * get the caff file details
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFileDetails()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFileDetails$Response(params: {
    id: number;
    context?: HttpContext
  }
): Observable<StrictHttpResponse<CaffDetailsResponse>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.GetFileDetailsPath, 'get');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<CaffDetailsResponse>;
      })
    );
  }

  /**
   * Your GET endpoint.
   *
   * get the caff file details
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getFileDetails$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFileDetails(params: {
    id: number;
    context?: HttpContext
  }
): Observable<CaffDetailsResponse> {

    return this.getFileDetails$Response(params).pipe(
      map((r: StrictHttpResponse<CaffDetailsResponse>) => r.body as CaffDetailsResponse)
    );
  }

  /**
   * Path part for operation putFilesModifyId
   */
  static readonly PutFilesModifyIdPath = '/files/modify/{id}';

  /**
   * modify the details of a caff file
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `putFilesModifyId()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  putFilesModifyId$Response(params: {
    id: number;
    context?: HttpContext
    body?: ModifyCaffRequest
  }
): Observable<StrictHttpResponse<CaffDetailsResponse>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.PutFilesModifyIdPath, 'put');
    if (params) {
      rb.path('id', params.id, {});
      rb.body(params.body, 'application/json');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<CaffDetailsResponse>;
      })
    );
  }

  /**
   * modify the details of a caff file
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `putFilesModifyId$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  putFilesModifyId(params: {
    id: number;
    context?: HttpContext
    body?: ModifyCaffRequest
  }
): Observable<CaffDetailsResponse> {

    return this.putFilesModifyId$Response(params).pipe(
      map((r: StrictHttpResponse<CaffDetailsResponse>) => r.body as CaffDetailsResponse)
    );
  }

  /**
   * Path part for operation getFilesPreview
   */
  static readonly GetFilesPreviewPath = '/files/preview/{id}';

  /**
   * Your GET endpoint.
   *
   * file preview download
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFilesPreview()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFilesPreview$Response(params: {
    id: number;
    context?: HttpContext
  }
): Observable<StrictHttpResponse<Blob>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.GetFilesPreviewPath, 'get');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: 'image/bmp',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Blob>;
      })
    );
  }

  /**
   * Your GET endpoint.
   *
   * file preview download
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getFilesPreview$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFilesPreview(params: {
    id: number;
    context?: HttpContext
  }
): Observable<Blob> {

    return this.getFilesPreview$Response(params).pipe(
      map((r: StrictHttpResponse<Blob>) => r.body as Blob)
    );
  }

  /**
   * Path part for operation getFilesDownload
   */
  static readonly GetFilesDownloadPath = '/files/download/{id}';

  /**
   * Your GET endpoint.
   *
   * download a caff file
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFilesDownload()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFilesDownload$Response(params: {
    id: number;
    context?: HttpContext
  }
): Observable<StrictHttpResponse<Blob>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.GetFilesDownloadPath, 'get');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'blob',
      accept: 'application/octet-stream',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<Blob>;
      })
    );
  }

  /**
   * Your GET endpoint.
   *
   * download a caff file
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `getFilesDownload$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFilesDownload(params: {
    id: number;
    context?: HttpContext
  }
): Observable<Blob> {

    return this.getFilesDownload$Response(params).pipe(
      map((r: StrictHttpResponse<Blob>) => r.body as Blob)
    );
  }

  /**
   * Path part for operation postFilesUpload
   */
  static readonly PostFilesUploadPath = '/files/upload';

  /**
   * upoad caff file
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `postFilesUpload()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  postFilesUpload$Response(params?: {
    context?: HttpContext
    body?: FileUploadRequest
  }
): Observable<StrictHttpResponse<FileUploadResponse>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.PostFilesUploadPath, 'post');
    if (params) {
      rb.body(params.body, 'multipart/form-data');
    }

    return this.http.request(rb.build({
      responseType: 'json',
      accept: 'application/json',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<FileUploadResponse>;
      })
    );
  }

  /**
   * upoad caff file
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `postFilesUpload$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  postFilesUpload(params?: {
    context?: HttpContext
    body?: FileUploadRequest
  }
): Observable<FileUploadResponse> {

    return this.postFilesUpload$Response(params).pipe(
      map((r: StrictHttpResponse<FileUploadResponse>) => r.body as FileUploadResponse)
    );
  }

  /**
   * Path part for operation postFilesBuyId
   */
  static readonly PostFilesBuyIdPath = '/files/buy/{id}';

  /**
   * Buy a caff file
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `postFilesBuyId()` instead.
   *
   * This method doesn't expect any request body.
   */
  postFilesBuyId$Response(params: {
    id: number;
    context?: HttpContext
  }
): Observable<StrictHttpResponse<void>> {

    const rb = new RequestBuilder(this.rootUrl, FilesService.PostFilesBuyIdPath, 'post');
    if (params) {
      rb.path('id', params.id, {});
    }

    return this.http.request(rb.build({
      responseType: 'text',
      accept: '*/*',
      context: params?.context
    })).pipe(
      filter((r: any) => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>;
      })
    );
  }

  /**
   * Buy a caff file
   *
   * This method provides access to only to the response body.
   * To access the full response (for headers, for example), `postFilesBuyId$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  postFilesBuyId(params: {
    id: number;
    context?: HttpContext
  }
): Observable<void> {

    return this.postFilesBuyId$Response(params).pipe(
      map((r: StrictHttpResponse<void>) => r.body as void)
    );
  }

}
