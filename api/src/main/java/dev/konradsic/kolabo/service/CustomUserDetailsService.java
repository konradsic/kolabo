package dev.konradsic.kolabo.service;

import dev.konradsic.kolabo.dao.UserDao;
import dev.konradsic.kolabo.exceptions.NotFoundException;
import dev.konradsic.kolabo.model.CustomUserDetails;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserDao userDao;

    public CustomUserDetailsService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    @NonNull
    public UserDetails loadUserByUsername(@NonNull String email) {
        return userDao.findByEmail(email)
                .map(CustomUserDetails::new)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));
    }
}
