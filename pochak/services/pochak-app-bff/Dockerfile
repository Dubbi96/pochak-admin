FROM eclipse-temurin:21-jdk-alpine AS builder

# Build common-lib first
WORKDIR /common-lib
COPY pochak-common-lib/gradlew .
COPY pochak-common-lib/gradle gradle
COPY pochak-common-lib/build.gradle.kts .
COPY pochak-common-lib/settings.gradle.kts .
COPY pochak-common-lib/src src
RUN chmod +x ./gradlew && ./gradlew publishToMavenLocal --no-daemon

# Build app BFF
WORKDIR /app
COPY pochak-app-bff/gradlew .
COPY pochak-app-bff/gradle gradle
COPY pochak-app-bff/build.gradle.kts .
COPY pochak-app-bff/settings.gradle.kts .
COPY pochak-app-bff/src src
RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 9081

ENTRYPOINT ["java", "-jar", "app.jar"]
