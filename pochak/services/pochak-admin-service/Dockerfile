FROM eclipse-temurin:21-jdk-alpine AS builder

# Build common-lib first
WORKDIR /common-lib
COPY pochak-common-lib/gradlew .
COPY pochak-common-lib/gradle gradle
COPY pochak-common-lib/build.gradle.kts .
COPY pochak-common-lib/settings.gradle.kts .
COPY pochak-common-lib/src src
RUN chmod +x ./gradlew && ./gradlew publishToMavenLocal --no-daemon

# Build service
WORKDIR /app
COPY pochak-admin-service/gradlew .
COPY pochak-admin-service/gradle gradle
COPY pochak-admin-service/build.gradle.kts .
COPY pochak-admin-service/settings.gradle.kts .
COPY pochak-admin-service/src src
RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
