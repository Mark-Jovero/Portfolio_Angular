
    module.exports = function setResponse(options) {
        return data = {
            __status: options.__status, 
            message: options.message,
            displayable_message: options.displayable_message,
            substatus: options.substatus,
            hasError: options.hasError,
            errorMessage: options.errorMessage,
            redirect: {
                inUse: options.redirect_inUse, 
                path: options.redirect_path,

            }, 
            request_result: {
                message: options.req_msg, 
                payload: options.req_payload
            }
        }
    }

