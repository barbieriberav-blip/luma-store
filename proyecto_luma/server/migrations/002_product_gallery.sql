CREATE TABLE product_images (
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 1 AND 5),
  url varchar(1000) NOT NULL,
  alt varchar(120) NOT NULL CHECK (char_length(alt) > 0),
  PRIMARY KEY (product_id, position),
  UNIQUE (product_id, url)
);
