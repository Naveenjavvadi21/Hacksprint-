package com.careflow.security;

import com.careflow.entity.User;
import com.careflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String trimmed = identifier != null ? identifier.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(trimmed)
                .or(() -> userRepository.findByNameIgnoreCase(trimmed))
                .or(() -> userRepository.findByEmailIgnoreCase(trimmed + "@careflow.ai"))
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with identifier: " + identifier));

        return UserDetailsImpl.build(user);
    }
}
