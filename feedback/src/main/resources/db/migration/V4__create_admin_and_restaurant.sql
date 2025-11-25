------------------------------------------------------------
-- 1) TABELA RESTAURANT
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255),
    link_google_avaliacao VARCHAR(255)
);

------------------------------------------------------------
-- 2) TABELA ADMIN_USER
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_user (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    restaurant_id BIGINT NOT NULL,
    CONSTRAINT fk_admin_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- 3) ALTERAR TABELA FEEDBACK PARA SUPORTAR ADMIN/DASHBOARD
------------------------------------------------------------

-- adicionar coluna restaurant_id
ALTER TABLE feedback
    ADD COLUMN IF NOT EXISTS restaurant_id BIGINT;

-- adicionar FK
ALTER TABLE feedback
    ADD CONSTRAINT fk_feedback_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurant(id)
        ON DELETE CASCADE;

-- marcar se o cupom foi validado
ALTER TABLE feedback
    ADD COLUMN IF NOT EXISTS cupom_validado BOOLEAN DEFAULT FALSE;

-- data de validação do cupom
ALTER TABLE feedback
    ADD COLUMN IF NOT EXISTS data_validacao_cupom TIMESTAMP;
