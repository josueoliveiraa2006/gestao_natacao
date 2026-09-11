CREATE TABLE inscricao (
id_inscricao SERIAL PRIMARY KEY,
tempo_max TIME(0) CHECK (tempo_max <= '01:00:00'),
observacoes VARCHAR(200)

);

ALTER TABLE inscricao 
ADD COLUMN matricula_competidor INTEGER,
ADD COLUMN prova_id INTEGER,
ADD COLUMN categoria_id INTEGER,
  ADD CONSTRAINT fk_inscricao_competidor 
    FOREIGN KEY (matricula_competidor) REFERENCES competidor(matricula),
    
  ADD CONSTRAINT fk_inscricao_prova 
    FOREIGN KEY (prova_id) REFERENCES provas(prova_id),
    
  ADD CONSTRAINT fk_inscricao_categoria 
    FOREIGN KEY (categoria_id) REFERENCES categoria(categoria_id);
;