package com.pochak.common.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ infrastructure configuration.
 * Declares the topic exchange, per-service queues, and bindings.
 * Only activated when spring.rabbitmq.host is configured.
 */
@Configuration
@ConditionalOnProperty(name = "spring.rabbitmq.host")
public class RabbitMqConfig {

    public static final String EXCHANGE_NAME = "pochak.events";

    public static final String QUEUE_IDENTITY = "identity.events";
    public static final String QUEUE_CONTENT = "content.events";
    public static final String QUEUE_COMMERCE = "commerce.events";
    public static final String QUEUE_OPERATION = "operation.events";
    public static final String QUEUE_ADMIN = "admin.events";

    // ── Exchange ──────────────────────────────────────────────────

    @Bean
    public TopicExchange pochakEventsExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE_NAME)
                .durable(true)
                .build();
    }

    // ── Queues ───────────────────────────────────────────────────

    @Bean
    public Queue identityEventsQueue() {
        return QueueBuilder.durable(QUEUE_IDENTITY).build();
    }

    @Bean
    public Queue contentEventsQueue() {
        return QueueBuilder.durable(QUEUE_CONTENT).build();
    }

    @Bean
    public Queue commerceEventsQueue() {
        return QueueBuilder.durable(QUEUE_COMMERCE).build();
    }

    @Bean
    public Queue operationEventsQueue() {
        return QueueBuilder.durable(QUEUE_OPERATION).build();
    }

    @Bean
    public Queue adminEventsQueue() {
        return QueueBuilder.durable(QUEUE_ADMIN).build();
    }

    // ── Bindings ─────────────────────────────────────────────────
    // Each queue receives events routed by service-specific routing key pattern.

    @Bean
    public Binding identityBinding(Queue identityEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(identityEventsQueue)
                .to(pochakEventsExchange)
                .with("identity.#");
    }

    @Bean
    public Binding contentBinding(Queue contentEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(contentEventsQueue)
                .to(pochakEventsExchange)
                .with("content.#");
    }

    @Bean
    public Binding commerceBinding(Queue commerceEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(commerceEventsQueue)
                .to(pochakEventsExchange)
                .with("commerce.#");
    }

    @Bean
    public Binding operationBinding(Queue operationEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(operationEventsQueue)
                .to(pochakEventsExchange)
                .with("operation.#");
    }

    @Bean
    public Binding adminBinding(Queue adminEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(adminEventsQueue)
                .to(pochakEventsExchange)
                .with("admin.#");
    }

    // ── Cross-service bindings for user withdrawal ──────────────
    // identity.UserWithdrawnEvent must be delivered to all services for cross-schema cleanup.

    @Bean
    public Binding contentIdentityWithdrawalBinding(Queue contentEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(contentEventsQueue)
                .to(pochakEventsExchange)
                .with("identity.UserWithdrawnEvent");
    }

    @Bean
    public Binding commerceIdentityWithdrawalBinding(Queue commerceEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(commerceEventsQueue)
                .to(pochakEventsExchange)
                .with("identity.UserWithdrawnEvent");
    }

    @Bean
    public Binding operationIdentityWithdrawalBinding(Queue operationEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(operationEventsQueue)
                .to(pochakEventsExchange)
                .with("identity.UserWithdrawnEvent");
    }

    @Bean
    public Binding adminIdentityWithdrawalBinding(Queue adminEventsQueue, TopicExchange pochakEventsExchange) {
        return BindingBuilder.bind(adminEventsQueue)
                .to(pochakEventsExchange)
                .with("identity.UserWithdrawnEvent");
    }

    // ── Message Converter ────────────────────────────────────────

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }
}
