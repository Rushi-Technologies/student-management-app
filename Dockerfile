# Use Maven with Amazon Corretto 17 to build the application
FROM maven:3.9.9-amazoncorretto-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package

# Use Amazon Corretto 17 JRE on Alpine for a small secure base
FROM amazoncorretto:17-alpine-jdk

# Working directory inside container
WORKDIR /app

# Copy the Spring Boot JAR from target folder from build stage
# (adjust file name if needed)
COPY --from=build /app/target/student-management*.jar app.jar

# Create non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose application port
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]