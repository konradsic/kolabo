package dev.konradsic.kolabo;

import dev.konradsic.kolabo.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(CorsProperties.class)
public class KolaboApplication {

    public static void main(String[] args) {
        SpringApplication.run(KolaboApplication.class, args);
    }

}
