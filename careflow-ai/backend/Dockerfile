# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
VOLUME /app/data
COPY --from=builder /app/target/*.jar app.jar

ENV PORT=9090
ENV H2_DB_PATH=/app/data/careflow_ai
ENV H2_CONSOLE_ENABLED=false
EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
