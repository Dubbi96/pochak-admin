FROM eclipse-temurin:21-jdk-alpine AS builder

# Build common-lib first
WORKDIR /common-lib
COPY pochak-common-lib/gradlew .
COPY pochak-common-lib/gradle gradle
COPY pochak-common-lib/build.gradle.kts .
COPY pochak-common-lib/settings.gradle.kts .
COPY pochak-common-lib/src src
RUN chmod +x ./gradlew && ./gradlew publishToMavenLocal --no-daemon

# Build web BFF
WORKDIR /app
COPY pochak-web-bff/gradlew .
COPY pochak-web-bff/gradle gradle
COPY pochak-web-bff/build.gradle.kts .
COPY pochak-web-bff/settings.gradle.kts .
COPY pochak-web-bff/src src
RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 9080

ENTRYPOINT ["java", "-jar", "app.jar"]
