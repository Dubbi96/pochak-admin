FROM eclipse-temurin:21-jdk-alpine AS builder

# Build common-lib first
WORKDIR /common-lib
COPY pochak-common-lib/gradlew .
COPY pochak-common-lib/gradle gradle
COPY pochak-common-lib/build.gradle.kts .
COPY pochak-common-lib/settings.gradle.kts .
COPY pochak-common-lib/src src
RUN chmod +x ./gradlew && ./gradlew publishToMavenLocal --no-daemon

# Build BO BFF
WORKDIR /app
COPY pochak-bo-bff/gradlew .
COPY pochak-bo-bff/gradle gradle
COPY pochak-bo-bff/build.gradle.kts .
COPY pochak-bo-bff/settings.gradle.kts .
COPY pochak-bo-bff/src src
RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 9090

ENTRYPOINT ["java", "-jar", "app.jar"]
