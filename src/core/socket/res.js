import keys from 'lodash/keys'
import remove from 'lodash/remove'
import isEmpty from 'lodash/isEmpty'
/**
 *
 */
class Response {
    constructor() {
        this._headers = {};
    }
    
    //addTrailers(headers) {
    //}
    //
    //append() {
    //
    //}
    //
    //set() {
    //}
    //
    //end() {
    //}
    //
    setHeader(name, value) {
        this._headers[name] = value
    }
    
    //
    getHeader(name) {
        return this._headers[name]
    }
    
    //
    getHeaderNames() {
        return keys(this._headers);
    }
    
    
    getHeaders() {
        return this._headers
    }
    
    
    hasHeader(name) {
        return !isEmpty(this._headers[name]);
    }
    
    removeHeader(name) {
        delete this._headers[name];
    }
    
    //
    //setTimeout() {
    //}
    //
    //get headersSent() {
    //}
    //
    //get sendDate() {
    //}
    //
    //get statusCode() {
    //}
    //
    //set statusCode(val) {
    //}
    //
    //get statusMessage() {
    //}
    //
    //set statusMessage(val) {
    //}
    //
    //write() {
    //}
    //
    //writeContinue() {
    //}
    //
    //writeHead() {
    //}
    //
    //writeProcessing() {
    //}
    
}

export default Response;
