Contorller란
=> 클라이언트 요청(문 두드리고 안으로 전달)

Service
=> 실제 비지니스 로직 처리( 계산, DB조회, 조건로직 // 안에서 진짜 일 처리하는 사람)

DTO(Data Transfer Object)
=> 클라이언트로부터 받을 데이터 형식, 유효성 검사용(들어오는 서류 방식)

ENTITY
=> DB 테이블과 1:1 매칭 되는 클레스(DB테이블 설계도)

Repository
=> DB 쿼리 전담, Entity 기준 CRUD 쿼리 담당(DB에게 말 걸어주는 사람)

Module
=> 위의 모든 것들을 하나의 기능 단위로 묶어주는 Nest의 단위(이 집은 어떤 구성원들로 운영되는지 등록하는 곳)
