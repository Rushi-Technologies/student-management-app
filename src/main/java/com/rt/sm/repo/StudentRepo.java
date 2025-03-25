package com.rt.sm.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rt.sm.pojo.Student;

@Repository
public interface StudentRepo extends MongoRepository<Student, String> {

}
