package cn.st4rlight.filestorage.repository;

import cn.st4rlight.filestorage.domain.MyFile;
import cn.st4rlight.filestorage.domain.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<MyFile, Long> {

    Optional<MyFile> findByMd5AndStatusNot(byte[] md5, Status status);
}
