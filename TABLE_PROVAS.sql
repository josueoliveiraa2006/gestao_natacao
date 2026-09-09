CREATE TABLE provas (
prova_id SERIAL PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
data_hora TIMESTAMP NOT NULL
);
ALTER TABLE provas ADD COLUMN id_local INT; 
ALTER TABLE provas ADD CONSTRAINT fk_provas_local FOREIGN KEY (id_local) REFERENCES local_competicao(local_id);
ALTER TABLE provas ADD COLUMN arbitro_id INTEGER; 
ALTER TABLE provas ADD CONSTRAINT fk_provas_arbitro FOREIGN KEY (arbitro_id) REFERENCES arbitro(arbitro_id);
ALTER TABLE provas ADD COLUMN categoria_id INTEGER; 
ALTER TABLE provas ADD CONSTRAINT fk_provas_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(categoria_id);