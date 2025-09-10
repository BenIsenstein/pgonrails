CREATE TABLE public.attendees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    event_id INT REFERENCES public.events(id) ON DELETE CASCADE
);

ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;