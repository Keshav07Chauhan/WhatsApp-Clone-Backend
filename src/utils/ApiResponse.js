class ApiResponse {
    constructor(statusCode, data, message="Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400   // if statusCode>=400 then it means error is there.
    }
}

export {ApiResponse}