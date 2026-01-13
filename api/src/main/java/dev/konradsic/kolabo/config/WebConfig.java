package dev.konradsic.kolabo.config;

import dev.konradsic.kolabo.api.RequestPathLoggerInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RequestPathLoggerInterceptor requestPathLoggerInterceptor;

    public WebConfig(RequestPathLoggerInterceptor requestPathLoggerInterceptor) {
        this.requestPathLoggerInterceptor = requestPathLoggerInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requestPathLoggerInterceptor);
    }
}
