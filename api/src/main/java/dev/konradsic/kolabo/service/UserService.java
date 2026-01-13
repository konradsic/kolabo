package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dao.UserDao;
import dev.konradsic.kolabo.model.User;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserDao userDao, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(String email, String password) {
        if (userDao.findByEmail(email).isPresent()) {
            logger.info("Checking for existing user with email: {}", email);
            throw new RuntimeException("User with email " + email + " already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));

        logger.info("Registering user with email {}", email);
        userDao.save(user);
        userDao.flush();
    }

    public User findByEmail(String email) {
        return userDao.findByEmail(email).orElse(null);
    }

    public User findById(UUID id) {
        return userDao.findById(id).orElse(null);
    }
}
