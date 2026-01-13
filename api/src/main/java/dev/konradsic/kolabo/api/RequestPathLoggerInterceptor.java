package dev.konradsic.kolabo.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestPathLoggerInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RequestPathLoggerInterceptor.class);

    // ANSI color codes
    private static final String RESET = "\u001B[0m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String RED = "\u001B[31m";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        logger.debug("Handling incoming HTTP {} request: {}", request.getMethod(), request.getRequestURI());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, HttpServletResponse response, @NonNull Object handler, Exception ex) {
        int status = response.getStatus();
        String stringHttpStatus;
        try {
            stringHttpStatus = HttpStatus.valueOf(status).name();
        } catch (IllegalArgumentException e) {
            stringHttpStatus = "UNKNOWN";
        }
        String color;
        if (200 <= status && status < 300) { color = GREEN; }
        else if (400 <= status && status < 500) { color = YELLOW; }
        else if (500 <= status && status < 600) { color = RED; }
        else { color = RESET; }

        logger.info("{} {} {}{} {}{}", request.getMethod(), request.getRequestURI(), color, status, stringHttpStatus, RESET);
    }
}
