package com.pochak.common.encryption;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

/**
 * Static holder for encryption beans.
 * JPA AttributeConverters are instantiated by Hibernate (not Spring),
 * so they cannot use constructor injection. This holder provides
 * static access to the encryption beans after the ApplicationContext loads.
 */
@Component
public class EncryptionBeanHolder implements ApplicationListener<ContextRefreshedEvent> {

    private static volatile EncryptionKeyProvider keyProvider;
    private static volatile DeterministicEncryptor deterministicEncryptor;
    private static volatile ProbabilisticEncryptor probabilisticEncryptor;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        ApplicationContext ctx = event.getApplicationContext();
        keyProvider = ctx.getBean(EncryptionKeyProvider.class);
        deterministicEncryptor = ctx.getBean(DeterministicEncryptor.class);
        probabilisticEncryptor = ctx.getBean(ProbabilisticEncryptor.class);
    }

    public static EncryptionKeyProvider getKeyProvider() {
        return keyProvider;
    }

    public static DeterministicEncryptor getDeterministicEncryptor() {
        return deterministicEncryptor;
    }

    public static ProbabilisticEncryptor getProbabilisticEncryptor() {
        return probabilisticEncryptor;
    }
}
