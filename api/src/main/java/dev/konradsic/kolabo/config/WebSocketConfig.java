package dev.konradsic.kolabo.config;

import dev.konradsic.kolabo.ws.DocumentWSComponent;
import dev.konradsic.kolabo.ws.HttpSessionHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final HttpSessionHandshakeInterceptor handshakeInterceptor;
    private final DocumentWSComponent documentWSComponent;

    public WebSocketConfig(DocumentWSComponent documentWSComponent, HttpSessionHandshakeInterceptor handshakeInterceptor) {
        this.documentWSComponent = documentWSComponent;
        this.handshakeInterceptor = handshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(documentWSComponent, "/ws/document/{docId}")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
