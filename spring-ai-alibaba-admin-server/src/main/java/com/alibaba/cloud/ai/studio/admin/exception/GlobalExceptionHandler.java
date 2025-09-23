package com.alibaba.cloud.ai.studio.admin.exception;

import com.alibaba.cloud.ai.studio.admin.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(StudioException.class)
    public Result<String> handleStudioException(StudioException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getErrCode(), ExceptionUtils.getAllExceptionMsg(e));
    }

    /**
     * 处理 @RequestBody 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<ValidationErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.warn("参数校验失败: {}", e.getMessage());
        
        List<ValidationErrorResponse.FieldError> fieldErrors = e.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> ValidationErrorResponse.FieldError.builder()
                        .field(error.getField())
                        .rejectedValue(error.getRejectedValue())
                        .message(error.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .message("参数校验失败")
                .fieldErrors(fieldErrors)
                .build();

        return Result.error(400, errorResponse.getMessage());
    }

    /**
     * 处理 @RequestParam 和 @PathVariable 参数校验异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<ValidationErrorResponse> handleConstraintViolationException(ConstraintViolationException e) {
        log.warn("参数校验失败: {}", e.getMessage());

        List<ValidationErrorResponse.FieldError> fieldErrors = e.getConstraintViolations()
                .stream()
                .map(violation -> {
                    String fieldName = getFieldName(violation);
                    return ValidationErrorResponse.FieldError.builder()
                            .field(fieldName)
                            .rejectedValue(violation.getInvalidValue())
                            .message(violation.getMessage())
                            .build();
                })
                .collect(Collectors.toList());

        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .message("参数校验失败")
                .fieldErrors(fieldErrors)
                .build();

        return Result.error(400, errorResponse.getMessage());
    }

    /**
     * 处理表单绑定参数校验异常
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<ValidationErrorResponse> handleBindException(BindException e) {
        log.warn("参数绑定校验失败: {}", e.getMessage());

        List<ValidationErrorResponse.FieldError> fieldErrors = e.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> ValidationErrorResponse.FieldError.builder()
                        .field(error.getField())
                        .rejectedValue(error.getRejectedValue())
                        .message(error.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .message("参数校验失败")
                .fieldErrors(fieldErrors)
                .build();

        return Result.error(400, errorResponse.getMessage());
    }

    /**
     * 处理JSON解析异常
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<String> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.warn("JSON解析异常: {}", e.getMessage());
        String message = "请求参数格式错误，请检查JSON格式是否正确";
        
        // 提取更具体的错误信息
        if (e.getMessage() != null) {
            if (e.getMessage().contains("JSON parse error")) {
                message = "JSON格式错误，请检查参数格式";
            } else if (e.getMessage().contains("Required request body is missing")) {
                message = "请求体不能为空";
            }
        }
        
        return Result.error(400, message);
    }

    /**
     * 处理其他未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<String> handleGeneralException(Exception e) {
        log.error("未处理的异常", e);
        return Result.error(500, "系统内部错误，请稍后重试:"+e.getMessage());
    }

    /**
     * 从约束违规中提取字段名
     */
    private String getFieldName(ConstraintViolation<?> violation) {
        String propertyPath = violation.getPropertyPath().toString();
        // 提取最后一个字段名
        String[] parts = propertyPath.split("\\.");
        return parts.length > 0 ? parts[parts.length - 1] : propertyPath;
    }
}
