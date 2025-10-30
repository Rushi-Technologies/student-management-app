# Use Amazon Corretto 17 JRE on Alpine for a small secure base
FROM amazoncorretto:17-alpine-jdk

# Working directory inside container
WORKDIR /app

# Copy the Spring Boot JAR from your local target folder
# (adjust file name if needed)
COPY target/student-management*.jar app.jar

# Create non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose application port
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]