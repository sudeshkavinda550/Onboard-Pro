--
-- PostgreSQL database dump
--

\restrict Y7mbqgj5X5wK5qwoJtToKjIxPCbfbjwC8RkAhXaW0VgoYnV2KFhF9wsAqsxjxpj

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(50),
    entity_id uuid,
    details jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    manager_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    task_id uuid,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_type character varying(100),
    file_size bigint,
    status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text,
    uploaded_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_by uuid,
    reviewed_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT documents_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: employee_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid,
    task_id uuid,
    status character varying(20) DEFAULT 'pending'::character varying,
    assigned_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_date timestamp without time zone,
    completed_date timestamp without time zone,
    notes text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    started_date timestamp without time zone,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_by uuid,
    CONSTRAINT employee_tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'overdue'::character varying])::text[])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'system'::character varying,
    is_read boolean DEFAULT false,
    link character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['task_assigned'::character varying, 'task_reminder'::character varying, 'task_completed'::character varying, 'document_uploaded'::character varying, 'document_approved'::character varying, 'document_rejected'::character varying, 'system'::character varying])::text[])))
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    template_id uuid,
    title character varying(200) NOT NULL,
    description text,
    task_type character varying(20) DEFAULT 'read'::character varying,
    is_required boolean DEFAULT true,
    estimated_time integer DEFAULT 30,
    order_index integer NOT NULL,
    resource_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tasks_task_type_check CHECK (((task_type)::text = ANY ((ARRAY['upload'::character varying, 'read'::character varying, 'watch'::character varying, 'meeting'::character varying, 'form'::character varying, 'training'::character varying])::text[])))
);


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    department_id uuid,
    estimated_completion_days integer DEFAULT 7,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'employee'::character varying,
    employee_id character varying(50),
    phone character varying(20),
    date_of_birth date,
    address text,
    profile_picture character varying(255),
    department_id uuid,
    "position" character varying(100),
    start_date date,
    manager_id uuid,
    onboarding_status character varying(20) DEFAULT 'not_started'::character varying,
    onboarding_completed_date date,
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(50),
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    login_attempts integer DEFAULT 0,
    account_locked_until timestamp without time zone,
    email_verification_token character varying(255),
    email_verification_expires timestamp without time zone,
    CONSTRAINT users_onboarding_status_check CHECK (((onboarding_status)::text = ANY ((ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'overdue'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['employee'::character varying, 'hr'::character varying, 'admin'::character varying])::text[])))
);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
74190512-a698-4d22-a458-e70b6ead309d	027f119a-2b29-40a9-a0f9-a2849c086e2c	create_hr_account	user	1319a9f6-07de-4396-a150-a994e890b5d6	{"name": "kamal", "email": "kamal@gmail.com", "department": "Sales"}	\N	\N	2026-02-19 19:52:32.776232
547bcff7-4d20-4bc0-8f79-47a385705f4d	cfcd33e7-5571-450c-ba4a-85782e0d0c97	create_hr_account	user	9c019bb2-66a3-41f5-b096-6f89819877ef	{"name": "sumith", "email": "sumith@gmail.com", "department": "Engineering", "employee_id": "HR2602928"}	\N	\N	2026-02-25 19:38:04.635541
e80321f0-ac49-439e-87be-34364ad85215	cfcd33e7-5571-450c-ba4a-85782e0d0c97	delete_hr_account	user	9c019bb2-66a3-41f5-b096-6f89819877ef	{"name": "sumith"}	\N	\N	2026-02-25 19:59:27.341339
e6583c8c-4b36-4224-a8b0-95402de7a642	cfcd33e7-5571-450c-ba4a-85782e0d0c97	delete_hr_account	user	1319a9f6-07de-4396-a150-a994e890b5d6	{"name": "kamal"}	\N	\N	2026-02-25 19:59:33.037502
c4c01a21-8356-4296-a36c-c7fd74b66e73	cfcd33e7-5571-450c-ba4a-85782e0d0c97	suspend_hr_account	user	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	{"name": "sudesh kavinda"}	\N	\N	2026-02-25 20:00:06.134304
888dcc28-718f-4bb6-bcb8-cd4761cb7c0e	cfcd33e7-5571-450c-ba4a-85782e0d0c97	restore_hr_account	user	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	{"name": "sudesh kavinda"}	\N	\N	2026-02-25 20:00:14.738073
2bc68a32-37ba-4c87-9184-1f684bab7547	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	7f541cc3-a4f6-478b-807f-2621c0adaaca	{"message": "You have no pending tasks at this time.", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-05 13:14:28.235058
b8c08bbd-90dd-4b9b-8549-c73c4cee6452	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	c665cd4c-da40-4c64-886d-7986497c0a93	{"message": "You have no pending tasks at this time.", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-05 13:14:28.286025
dd2c7151-cef3-4715-a527-82345a64ee1c	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	d0dc32ed-e342-4980-b67b-3421c07986e5	{"message": "You have pending tasks, please complete them as soon as possible.", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:26:47.696288
588aa8b6-475a-4849-8870-80d01f2943e5	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	7ee39740-bc21-4554-b6d8-eee5b14df14f	{"message": "Please complete your pending tasks", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 11:29:13.844506
e400e7f4-f7e9-4fca-bc3f-5081e42beb47	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	1dcad8e8-09c6-4c10-b444-dcc8a4cc5130	{"message": "Please complete your pending tasks", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 11:30:47.441934
26cbe2b2-1bbb-4daf-8c30-031f1824e26d	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	263d9ffd-1b6c-424d-8411-015d23ac89dd	{"message": "You have no pending tasks", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 11:30:47.565768
e74fe422-3b24-4b8d-814b-33fd4120e941	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	1a7dcb93-0349-4001-a663-34c27601b8b6	{"message": "Please complete your pending tasks", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:32:49.808041
e902c84a-95ee-4232-bddc-54a0771e33d4	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	75c54224-4186-4e8b-89cb-1c787c587a49	{"message": "Please complete your pending tasks: [FORM] complete, [FORM] Complete Employee Information Form, [UPLOAD] Upload Identification Documents, [UPLOAD] Read Company Handbook, [WATCH] Watch Security Training Video, [MEETING] Meet with HR Manager, [TRAINING] Complete Development Environment Setup", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:32:50.587984
b73b126b-5d95-4001-b7b8-057a48e50044	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	7646e876-2bbe-4164-a783-1e4c58053a10	{"message": "You have no pending tasks", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:32:52.629924
14876aa2-29b6-4a4a-bb36-fac5e30c1519	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	55963aa2-8ec5-41a3-bedf-b7f04511777b	{"message": "Please complete your pending tasks: ", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:40:30.710426
91b041ab-cad9-4718-802f-7edda158c1e9	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	3a75fc23-5a71-4011-bb94-ef2074efe36b	{"message": "Please complete your pending tasks: ", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:42:07.799824
beefec73-5a81-49b1-bf01-ddd10e90cb71	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	7f21860d-dd6c-4cba-b3d0-64da8f2af4a8	{"message": "Please complete your pending tasks: ", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:46:28.29275
4d7d1914-918e-4f6e-93de-7e23c87f1e86	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	f5007e73-c537-4138-9de6-ac089768e882	{"message": "Please complete your pending tasks: Task 1, Task 2, Task 3", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 11:46:29.487678
4e516ba9-7cfc-42e6-af69-543c58af9c88	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	e5a3a135-0993-44c3-aee5-b50a2eec42da	{"message": "Please complete your pending tasks: ", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 11:47:16.385481
b46f2494-3ad9-45a8-ab7e-bce950cab6e1	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	a2d27535-5c82-4930-8939-3b29618440e0	{"message": "Please complete your pending tasks: Task 1, Task 2, Task 3", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 11:47:17.086162
9d2f7b20-06c5-4963-b20b-33a3c348ff87	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	0f41f675-8201-403d-8339-765e6d0eacba	{"message": "Reminder: Please complete your pending tasks: TASKS_FROM_GET_EMPLOYEE_TASKS", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 16:35:18.152897
68ccd0b6-748f-4897-b071-db09146a5261	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	9b06b3c6-6594-44e5-a435-31d9ad938ed6	{"message": "Please complete: task1, task2, task3", "sent_to": "8dc2a45e-6e30-4a12-ba5a-de7d0d31de47"}	\N	\N	2026-03-06 16:44:55.326662
0fd6a3aa-9f8e-4058-90e1-c85c99c4a28d	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	reminder_sent	notification	359db53e-1785-4546-a025-f94fd963e10a	{"message": "Please complete: complete, Complete Employee Information Form, Upload Identification Documents, Read Company Handbook, Watch Security Training Video, Meet with HR Manager, Complete Development Environment Setup", "sent_to": "24eb81c6-2382-4353-91b8-09e06f8001d2"}	\N	\N	2026-03-06 16:48:16.411286
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, description, manager_id, created_at, updated_at) FROM stdin;
3dd9fa39-d9d6-4eee-bee5-e444c4534803	Engineering	Software Development and Engineering	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611
b1eb6a9c-4816-451d-b382-16f163ff948a	Sales	Sales and Business Development	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611
c756303b-fa92-460a-9398-8dae973a62b6	Marketing	Marketing and Communications	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611
fc854b8d-1060-4640-87bb-ad5f0f49375e	HR	Human Resources	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611
1b0965ed-be84-4a4e-ba24-db7c74a25554	Finance	Finance and Accounting	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611
cf8dd02b-121a-49e3-aa14-7304d05f7a8d	Operations	Operations and Support	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, employee_id, task_id, filename, original_filename, file_path, file_type, file_size, status, rejection_reason, uploaded_date, reviewed_by, reviewed_date, created_at, updated_at) FROM stdin;
925aa475-c4d0-4416-8bb4-1150087d5dda	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	81ee3b3e-140c-4164-aa13-64fd4237395e	document-1770985159697-343244364.pdf	Streamlined-Onboarding-and-Task-Management-System.pdf	uploads\\documents\\document-1770985159697-343244364.pdf	application/pdf	3267634	approved	\N	2026-02-13 17:49:19.898254	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	2026-02-13 17:49:50.239758	2026-02-13 17:49:19.898254	2026-02-13 17:49:50.239758
68fe7d91-99ab-4de0-a792-9feae6955729	24eb81c6-2382-4353-91b8-09e06f8001d2	\N	document-1772800749589-819490775.png	Screenshot (1).png	uploads\\documents\\document-1772800749589-819490775.png	image/png	221579	pending	\N	2026-03-06 18:09:09.748497	\N	\N	2026-03-06 18:09:09.748497	2026-03-06 18:09:09.748497
8682f3d3-64f0-44ed-8cee-ee17efc472ca	6d80f061-21b9-4a88-9441-5999880476f6	\N	document-1772822863054-747803880.png	Screenshot (1).png	uploads\\documents\\document-1772822863054-747803880.png	image/png	221579	pending	\N	2026-03-07 00:17:43.57489	\N	\N	2026-03-07 00:17:43.57489	2026-03-07 00:17:43.57489
\.


--
-- Data for Name: employee_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_tasks (id, employee_id, task_id, status, assigned_date, due_date, completed_date, notes, is_read, created_at, updated_at, started_date, priority, assigned_by) FROM stdin;
cd4972f0-9a20-48a5-ace5-6464ee342434	6d80f061-21b9-4a88-9441-5999880476f6	9fc04c46-d1f3-4f1a-8fe5-f1bfb8d3a5fb	completed	2026-03-06 22:01:39.395747	2026-03-21 22:01:39.048	2026-03-07 23:33:58.386	\N	f	2026-03-06 22:01:39.395747	2026-03-07 23:33:58.386982	2026-03-07 23:33:52.544	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
529fcb19-8852-4847-bc66-e1982af39691	6d80f061-21b9-4a88-9441-5999880476f6	ec9a9bd4-2abe-4d89-a48e-625a12401b3b	completed	2026-03-06 22:01:39.384634	2026-03-21 22:01:39.048	2026-03-08 02:17:46.104	\N	f	2026-03-06 22:01:39.384634	2026-03-08 02:17:46.107738	2026-03-07 23:38:57.861	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
405c9ff6-0c69-4f82-a263-c1aa13a073a3	6d80f061-21b9-4a88-9441-5999880476f6	6512afb8-2ddf-4deb-a29e-e9a932a0d6e6	completed	2026-03-06 22:01:39.361503	2026-03-21 22:01:39.048	2026-03-08 02:18:03.975	\N	f	2026-03-06 22:01:39.361503	2026-03-08 02:18:03.976732	2026-03-08 02:18:02.027	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
7e30c92e-9b80-4430-90fb-65fdb221bc9b	6d80f061-21b9-4a88-9441-5999880476f6	07d09bd6-f6dd-41d2-b85a-1fca65b6f313	completed	2026-03-06 22:01:39.379053	2026-03-21 22:01:39.048	2026-03-08 02:18:08.72	\N	f	2026-03-06 22:01:39.379053	2026-03-08 02:18:08.721136	2026-03-08 02:18:05.569	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
256015b0-52cf-4936-ae1c-4715c86513ca	24eb81c6-2382-4353-91b8-09e06f8001d2	94aa3d4d-8c4f-4485-95dd-bb8654781783	completed	2026-03-06 11:40:56.516158	2026-03-21 11:40:56.169	2026-03-06 16:50:19.409	\N	f	2026-03-06 11:40:56.516158	2026-03-06 16:50:19.410363	2026-03-06 16:50:11.396	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
a645e37a-f1f7-43e6-8679-f7c25132ec11	24eb81c6-2382-4353-91b8-09e06f8001d2	6512afb8-2ddf-4deb-a29e-e9a932a0d6e6	completed	2026-03-06 11:40:56.550718	2026-03-21 11:40:56.169	2026-03-06 16:50:45.178	\N	f	2026-03-06 11:40:56.550718	2026-03-06 16:50:45.178646	2026-03-06 16:50:41.798	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
0ebf2816-0613-47b4-839b-21590fc555c5	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	c0a01cb8-f8ce-4b14-9b54-c1129c0f89ae	completed	2026-02-11 00:52:30.192064	2026-02-26 00:52:28.562	2026-02-13 17:32:36.371	\N	f	2026-02-11 00:52:30.192064	2026-02-13 17:32:36.372355	2026-02-13 17:32:30.295	medium	\N
40164f92-d193-4de9-a0de-bdd39d072996	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	f7889f1f-4798-4526-9381-132a76e34e5d	completed	2026-02-11 00:52:30.173295	2026-02-26 00:52:28.562	2026-02-13 17:33:36.61	\N	f	2026-02-11 00:52:30.173295	2026-02-13 17:33:36.611424	2026-02-13 17:33:32.256	medium	\N
81ee3b3e-140c-4164-aa13-64fd4237395e	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	11c8df67-e283-42b3-ae3a-2fc3a5ac18c4	completed	2026-02-11 00:52:30.044727	2026-02-26 00:52:28.562	2026-02-13 17:49:50.338	\N	f	2026-02-11 00:52:30.044727	2026-02-13 17:49:50.34013	2026-02-13 17:47:54.264	medium	\N
9d65307d-9207-4af5-abc9-da9abc2138aa	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	ddfcd3fd-cc61-4223-96ed-a68a47cc36d9	completed	2026-02-11 00:52:30.121151	2026-02-26 00:52:28.562	2026-03-03 21:13:34.298	\N	f	2026-02-11 00:52:30.121151	2026-03-03 21:13:34.298649	2026-03-03 21:13:32.465	medium	\N
6afcb7d9-9d2c-4660-87ab-c732f98daa4c	24eb81c6-2382-4353-91b8-09e06f8001d2	7ffa38b1-8f72-4dd9-85a2-241c8787d721	completed	2026-03-06 11:41:45.261229	2026-03-21 11:41:45.077	2026-03-06 16:51:00.087	\N	f	2026-03-06 11:41:45.261229	2026-03-06 16:51:00.087982	2026-03-06 16:50:56.259	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
9fb7277a-030f-486d-84d0-9ac90f846da2	24eb81c6-2382-4353-91b8-09e06f8001d2	11c8df67-e283-42b3-ae3a-2fc3a5ac18c4	completed	2026-03-06 11:41:45.305386	2026-03-21 11:41:45.077	2026-03-06 16:51:03.225	\N	f	2026-03-06 11:41:45.305386	2026-03-06 16:51:03.225255	2026-03-06 16:51:01.749	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
6fef016d-a788-45a0-81a8-2a7e4e7abfd9	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	33d1a44c-5753-4c8d-bdc7-83fe46939b06	completed	2026-02-11 00:52:30.063794	2026-02-26 00:52:28.562	2026-02-12 23:14:08.553	\N	f	2026-02-11 00:52:30.063794	2026-02-12 23:14:08.55386	2026-02-12 23:14:02.81	medium	\N
86df5054-45ae-4ebd-8528-c849105141ac	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	7ffa38b1-8f72-4dd9-85a2-241c8787d721	completed	2026-02-11 00:52:28.569287	2026-02-26 00:52:28.562	2026-02-12 23:14:10.001	\N	f	2026-02-11 00:52:28.569287	2026-02-12 23:14:10.002179	2026-02-12 22:27:03.462	medium	\N
c9c2f082-39be-40d3-94c3-7275dc715385	24eb81c6-2382-4353-91b8-09e06f8001d2	977d715f-f355-41ff-9b3d-96ae1c2cafd1	completed	2026-03-06 11:40:56.556479	2026-03-21 11:40:56.169	2026-03-06 16:51:13.847	\N	f	2026-03-06 11:40:56.556479	2026-03-06 16:51:13.847486	2026-03-06 16:50:47.115	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
f1977ec5-db40-4764-b7f9-04579001151e	24eb81c6-2382-4353-91b8-09e06f8001d2	07d09bd6-f6dd-41d2-b85a-1fca65b6f313	completed	2026-03-06 11:40:56.565473	2026-03-21 11:40:56.169	2026-03-06 16:51:15.018	\N	f	2026-03-06 11:40:56.565473	2026-03-06 16:51:15.019165	2026-03-06 16:50:48.387	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
7cbda957-d7ec-41b1-8c7c-f1de86b29556	24eb81c6-2382-4353-91b8-09e06f8001d2	ec9a9bd4-2abe-4d89-a48e-625a12401b3b	completed	2026-03-06 11:40:56.572997	2026-03-21 11:40:56.169	2026-03-06 16:51:15.986	\N	f	2026-03-06 11:40:56.572997	2026-03-06 16:51:15.987028	2026-03-06 16:50:49.57	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
636e210e-2867-416f-a610-1a46347286b1	24eb81c6-2382-4353-91b8-09e06f8001d2	9fc04c46-d1f3-4f1a-8fe5-f1bfb8d3a5fb	completed	2026-03-06 11:40:56.581652	2026-03-21 11:40:56.169	2026-03-06 16:51:16.92	\N	f	2026-03-06 11:40:56.581652	2026-03-06 16:51:16.920959	2026-03-06 16:50:54.017	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
7d50fc96-88cc-4d2f-a38e-6302b064201d	24eb81c6-2382-4353-91b8-09e06f8001d2	33d1a44c-5753-4c8d-bdc7-83fe46939b06	completed	2026-03-06 11:41:45.311278	2026-03-21 11:41:45.077	2026-03-06 16:51:17.894	\N	f	2026-03-06 11:41:45.311278	2026-03-06 16:51:17.895202	2026-03-06 16:51:06.153	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
93ac4b6a-f694-4249-b294-3cf1618f01d5	24eb81c6-2382-4353-91b8-09e06f8001d2	ddfcd3fd-cc61-4223-96ed-a68a47cc36d9	completed	2026-03-06 11:41:45.316471	2026-03-21 11:41:45.077	2026-03-06 16:51:18.759	\N	f	2026-03-06 11:41:45.316471	2026-03-06 16:51:18.759741	2026-03-06 16:51:06.935	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
30405df0-0488-49f8-9188-69e9ba6ed5f3	24eb81c6-2382-4353-91b8-09e06f8001d2	f7889f1f-4798-4526-9381-132a76e34e5d	completed	2026-03-06 11:41:45.353762	2026-03-21 11:41:45.077	2026-03-06 16:51:19.665	\N	f	2026-03-06 11:41:45.353762	2026-03-06 16:51:19.665634	2026-03-06 16:51:07.685	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
cfca594c-4fcb-43d2-8e9a-8f3ca19c5d09	24eb81c6-2382-4353-91b8-09e06f8001d2	c0a01cb8-f8ce-4b14-9b54-c1129c0f89ae	completed	2026-03-06 11:41:45.386537	2026-03-21 11:41:45.077	2026-03-06 16:51:20.551	\N	f	2026-03-06 11:41:45.386537	2026-03-06 16:51:20.552207	2026-03-06 16:51:10.503	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
c1d68553-47a0-4840-a557-7722d6e05aab	6d80f061-21b9-4a88-9441-5999880476f6	94aa3d4d-8c4f-4485-95dd-bb8654781783	completed	2026-03-06 22:01:39.220748	2026-03-21 22:01:39.048	2026-03-06 23:57:21.547	\N	f	2026-03-06 22:01:39.220748	2026-03-06 23:57:21.548355	2026-03-06 23:22:34.365	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
53499ebf-6848-4381-844a-0642dc83b022	6d80f061-21b9-4a88-9441-5999880476f6	977d715f-f355-41ff-9b3d-96ae1c2cafd1	completed	2026-03-06 22:01:39.367611	2026-03-21 22:01:39.048	2026-03-07 22:57:10.877	\N	f	2026-03-06 22:01:39.367611	2026-03-07 22:57:10.897859	2026-03-07 00:08:42.619	medium	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, type, is_read, link, created_at) FROM stdin;
d21c132f-2131-4437-bc30-f645542c897f	ce1cd86f-f35d-461f-b79d-13deed894707	Onboarding Milestone	Sudesh Kavinda completed onboarding in 22 days	system	f	/admin/employees	2026-03-06 16:51:20.574185
d8ee6140-868d-4144-9ba5-4e4f1fb2baa0	027f119a-2b29-40a9-a0f9-a2849c086e2c	Onboarding Milestone	Sudesh Kavinda completed onboarding in 22 days	system	f	/admin/employees	2026-03-06 16:51:20.574227
ec5831f5-955b-43b6-bbef-5b78e68d5a53	cfcd33e7-5571-450c-ba4a-85782e0d0c97	Onboarding Milestone	Sudesh Kavinda completed onboarding in 22 days	system	f	/admin/employees	2026-03-06 16:51:20.771211
0d84556e-4b53-4266-bcc5-cbc4c7561103	24eb81c6-2382-4353-91b8-09e06f8001d2	Onboarding Complete!	Congratulations! You've completed your onboarding in 22 days. Welcome to the team!	task_completed	t	/employee/dashboard	2026-03-06 16:51:20.570619
a9e23ade-e862-4157-aa98-a707116d6bee	24eb81c6-2382-4353-91b8-09e06f8001d2	Halfway There!	Great progress! You've completed 7 of 13 tasks. Keep going!	system	t	/employee/tasks	2026-03-06 16:51:15.036384
9b06b3c6-6594-44e5-a435-31d9ad938ed6	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Reminder	Please complete: task1, task2, task3	task_reminder	t	\N	2026-03-06 16:44:55.263114
e5a3a135-0993-44c3-aee5-b50a2eec42da	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Reminder	Please complete your pending tasks: 	task_reminder	t	\N	2026-03-06 11:47:16.376374
7f21860d-dd6c-4cba-b3d0-64da8f2af4a8	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Reminder	Please complete your pending tasks: 	task_reminder	t	\N	2026-03-06 11:46:28.109167
55963aa2-8ec5-41a3-bedf-b7f04511777b	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Reminder	Please complete your pending tasks: 	task_reminder	t	\N	2026-03-06 11:40:30.58437
3a75fc23-5a71-4011-bb94-ef2074efe36b	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Reminder	Please complete your pending tasks: 	task_reminder	t	\N	2026-03-06 11:42:07.785345
fa021869-634f-4cc9-92cf-fc6917e54c1d	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Task Reminder	Reminder: Please complete "Complete your pending onboarding tasks"	task_reminder	t	/employee/tasks	2026-03-06 18:49:26.418487
9667fc63-f09a-40ba-af97-054559daaf06	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Complete!	Congratulations! You've completed your onboarding in 23 days. Welcome to the team!	task_completed	t	/employee/dashboard	2026-03-03 21:13:34.32194
c665cd4c-da40-4c64-886d-7986497c0a93	8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Onboarding Reminder	You have no pending tasks at this time.	task_reminder	t	\N	2026-03-05 13:14:28.284407
5ba55c7c-78db-4074-8a5b-e5de18c5095e	ce1cd86f-f35d-461f-b79d-13deed894707	Onboarding Milestone	Sudesh Kavinda completed onboarding in 23 days	system	f	/admin/employees	2026-03-03 21:13:35.345859
0f729c66-f148-43d6-874a-7258203cf64c	027f119a-2b29-40a9-a0f9-a2849c086e2c	Onboarding Milestone	Sudesh Kavinda completed onboarding in 23 days	system	f	/admin/employees	2026-03-03 21:13:35.346009
630f04df-a391-40cf-89c5-c89744632f2c	cfcd33e7-5571-450c-ba4a-85782e0d0c97	Onboarding Milestone	Sudesh Kavinda completed onboarding in 23 days	system	f	/admin/employees	2026-03-03 21:13:35.431552
97d5e82f-3f6b-4035-aa66-4a421583ea95	b5cd3a46-f713-4a5d-936b-4cb56e8de6c8	Welcome to the Team!	Your account has been created. Login credentials have been sent to sudeshkavinda734@gmail.com.	system	f	/employee/dashboard	2026-03-08 00:17:14.056018
e2b2c68a-2050-4f99-aade-de5004400928	b5cd3a46-f713-4a5d-936b-4cb56e8de6c8	Account Credentials	Your account has been created. Email: sudeshkavinda734@gmail.com. Please change your password on first login.	system	f	/employee/profile	2026-03-08 00:17:14.178512
11055445-6854-4b53-96f1-d454eb4beaa2	fad54c3b-918b-4f4b-9a85-47f204a7e127	Onboarding Milestone	Kamal Perera completed onboarding in 4 days	system	t	/admin/employees	2026-03-08 02:18:08.759698
c870f40c-b885-4334-82f8-c17f1e4248e2	6d80f061-21b9-4a88-9441-5999880476f6	Task Reminder	Reminder: Please complete "Complete your pending onboarding tasks"	task_reminder	t	/employee/tasks	2026-03-06 20:04:34.643768
ed87a477-5896-4bee-a67c-1ee479aabbde	6d80f061-21b9-4a88-9441-5999880476f6	Account Credentials	Your account has been created. Email: kamal@gmail.com. Please change your password on first login.	system	t	/employee/profile	2026-03-06 18:53:11.792304
6fd82ab1-37a1-475b-924e-dc5e5d4a8bd9	6d80f061-21b9-4a88-9441-5999880476f6	Welcome to the Team!	Your account has been created. Login credentials have been sent to kamal@gmail.com.	system	t	/employee/dashboard	2026-03-06 18:53:11.707383
b2a8e666-98a3-4030-9c47-e25f33a0a96c	6d80f061-21b9-4a88-9441-5999880476f6	Halfway There!	Great progress! You've completed 3 of 6 tasks. Keep going!	system	t	/employee/tasks	2026-03-07 22:58:09.739319
d1886ca8-d6f6-4543-bdb3-d756a42fbb0a	6d80f061-21b9-4a88-9441-5999880476f6	Halfway There!	Great progress! You've completed 3 of 6 tasks. Keep going!	system	t	/employee/tasks	2026-03-07 23:33:58.43668
b2b04d08-e6d0-4240-8cb2-0421fa251636	6d80f061-21b9-4a88-9441-5999880476f6	Onboarding Complete!	Congratulations! You've completed your onboarding in 4 days. Welcome to the team!	task_completed	t	/employee/dashboard	2026-03-08 02:18:08.753675
b64fe672-b7d7-4af8-8b03-b3a85e0253f8	ce1cd86f-f35d-461f-b79d-13deed894707	Onboarding Milestone	Kamal Perera completed onboarding in 4 days	system	f	/admin/employees	2026-03-08 02:18:08.759618
1f229750-2f07-4b4b-b30c-3d112df96f08	cfcd33e7-5571-450c-ba4a-85782e0d0c97	Onboarding Milestone	Kamal Perera completed onboarding in 4 days	system	f	/admin/employees	2026-03-08 02:18:08.857348
fdb90045-8d6b-4de5-8a85-9c80c5ab01c6	027f119a-2b29-40a9-a0f9-a2849c086e2c	Onboarding Milestone	Kamal Perera completed onboarding in 4 days	system	f	/admin/employees	2026-03-08 02:18:08.857663
055fbd9f-d100-4bf7-96e1-363ce806c044	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Upload Identification Documents	task_completed	t	/hr/employees	2026-03-08 02:18:03.986759
ad30649c-d5d6-4110-8747-ea5f9dd7c077	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Watch Security Training Video	task_completed	t	/hr/employees	2026-03-08 02:18:08.730493
b3f08a5b-9deb-4a2b-8127-de62c7c88563	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Employee Onboarding Complete	Kamal Perera has completed onboarding in 4 days	task_completed	t	/hr/employees	2026-03-08 02:18:08.757577
d697625f-b29d-473e-b00f-c0321f302209	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	New Employee Added	Kavinda Sudesh from Finance is starting on 3/7/2026	system	t	/hr/employees	2026-03-08 00:17:13.964236
a124eabd-d4bf-493e-ba3a-90dd994ba9c7	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	New Employee Added	Kamal Perera from Marketing is starting on 3/6/2026	system	t	/hr/employees	2026-03-06 18:53:11.66886
6ea18c14-4d40-4b92-aa85-c35b77a1e63a	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Complete Employee Information Form	task_completed	t	/hr/employees	2026-03-06 23:57:21.59147
0f2759b8-f84b-41f7-8d9b-42294a5f689d	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Read Company Handbook	task_completed	t	/hr/employees	2026-03-07 22:57:10.947112
cd120f66-1e3a-45e7-8452-11e12f7089d7	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Upload Identification Documents	task_completed	t	/hr/employees	2026-03-07 22:58:09.72964
1a7367d5-cda3-47aa-995a-903fdb480c1d	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Complete Development Environment Setup	task_completed	t	/hr/employees	2026-03-07 23:33:58.399504
977182a5-311b-4cfd-b2ea-8188efb50487	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	Task Completed	Kamal Perera has completed the task: Meet with HR Manager	task_completed	t	/hr/employees	2026-03-08 02:17:46.126717
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, template_id, title, description, task_type, is_required, estimated_time, order_index, resource_url, created_at, updated_at) FROM stdin;
7ffa38b1-8f72-4dd9-85a2-241c8787d721	70d6c357-22a6-4c77-83b1-3204719ede80	Complete Employee Information Form	Fill out your personal and emergency contact information	form	t	15	1	/forms/employee-info	2026-02-01 23:06:22.651702	2026-02-01 23:06:22.651702
11c8df67-e283-42b3-ae3a-2fc3a5ac18c4	70d6c357-22a6-4c77-83b1-3204719ede80	Upload Identification Documents	Upload a copy of your ID and required employment documents	upload	t	10	2	\N	2026-02-01 23:06:22.783851	2026-02-01 23:06:22.783851
ddfcd3fd-cc61-4223-96ed-a68a47cc36d9	70d6c357-22a6-4c77-83b1-3204719ede80	Watch Security Training Video	Complete the mandatory security awareness training	watch	t	45	4	https://training.onboardpro.com/security	2026-02-01 23:06:22.844259	2026-02-01 23:06:22.844259
33d1a44c-5753-4c8d-bdc7-83fe46939b06	70d6c357-22a6-4c77-83b1-3204719ede80	Read Company Handbook	Review our company policies and procedures	upload	t	60	3	/documents/company-handbook.pdf	2026-02-01 23:06:22.855998	2026-02-01 23:06:22.855998
c0a01cb8-f8ce-4b14-9b54-c1129c0f89ae	70d6c357-22a6-4c77-83b1-3204719ede80	Complete Development Environment Setup	Set up your development tools and access to systems	training	t	120	6	/guides/dev-setup	2026-02-01 23:06:22.866405	2026-02-01 23:06:22.866405
f7889f1f-4798-4526-9381-132a76e34e5d	70d6c357-22a6-4c77-83b1-3204719ede80	Meet with HR Manager	Schedule and attend your orientation meeting	meeting	t	60	5	\N	2026-02-01 23:06:22.918217	2026-02-01 23:06:22.918217
94aa3d4d-8c4f-4485-95dd-bb8654781783	e3fc64c5-d116-4480-8ab1-2faaedcc5080	Complete Employee Information Form	Fill out your personal and emergency contact information	form	t	15	1	/forms/employee-info	2026-03-05 16:04:25.082276	2026-03-05 16:04:25.082276
6512afb8-2ddf-4deb-a29e-e9a932a0d6e6	e3fc64c5-d116-4480-8ab1-2faaedcc5080	Upload Identification Documents	Upload a copy of your ID and required employment documents	upload	t	10	2	\N	2026-03-05 16:04:25.183262	2026-03-05 16:04:25.183262
ec9a9bd4-2abe-4d89-a48e-625a12401b3b	e3fc64c5-d116-4480-8ab1-2faaedcc5080	Meet with HR Manager	Schedule and attend your orientation meeting	meeting	t	60	5	\N	2026-03-05 16:04:25.201923	2026-03-05 16:04:25.201923
9fc04c46-d1f3-4f1a-8fe5-f1bfb8d3a5fb	e3fc64c5-d116-4480-8ab1-2faaedcc5080	Complete Development Environment Setup	Set up your development tools and access to systems	training	t	120	6	/guides/dev-setup	2026-03-05 16:04:25.215758	2026-03-05 16:04:25.215758
977d715f-f355-41ff-9b3d-96ae1c2cafd1	e3fc64c5-d116-4480-8ab1-2faaedcc5080	Read Company Handbook	Review our company policies and procedures	upload	t	60	3	/documents/company-handbook.pdf	2026-03-05 16:04:25.234111	2026-03-05 16:04:25.234111
07d09bd6-f6dd-41d2-b85a-1fca65b6f313	e3fc64c5-d116-4480-8ab1-2faaedcc5080	Watch Security Training Video	Complete the mandatory security awareness training	watch	t	45	4	https://training.onboardpro.com/security	2026-03-05 16:04:25.23436	2026-03-05 16:04:25.23436
3b503183-33bb-4a91-ae78-40779f6f972f	06580abf-df24-405d-8be2-aa5336d4520e	complete	aaaaaaaaaaaa	form	t	30	1	\N	2026-03-06 17:53:45.420842	2026-03-06 17:53:45.420842
5b9ca275-9a44-4864-ae69-c1be8df3db41	06580abf-df24-405d-8be2-aa5336d4520e	aaaaaa	aaaaaa	read	t	30	2	\N	2026-03-06 17:53:45.479987	2026-03-06 17:53:45.479987
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.templates (id, name, description, department_id, estimated_completion_days, is_active, created_by, created_at, updated_at) FROM stdin;
70d6c357-22a6-4c77-83b1-3204719ede80	Engineering Onboarding	Standard onboarding process for engineering team members	3dd9fa39-d9d6-4eee-bee5-e444c4534803	15	t	ce1cd86f-f35d-461f-b79d-13deed894707	2026-01-29 18:40:11.302611	2026-02-01 23:06:22.512037
e3fc64c5-d116-4480-8ab1-2faaedcc5080	Engineering Onboarding	Standard onboarding process for engineering team members	3dd9fa39-d9d6-4eee-bee5-e444c4534803	15	t	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	2026-03-05 15:48:30.221703	2026-03-05 16:04:25.008078
06580abf-df24-405d-8be2-aa5336d4520e	Software Engineer Onboarding	aaaaaaaaaaaaa	fc854b8d-1060-4640-87bb-ad5f0f49375e	7	t	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	2026-02-10 14:49:04.040565	2026-03-06 17:53:45.34023
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, employee_id, phone, date_of_birth, address, profile_picture, department_id, "position", start_date, manager_id, onboarding_status, onboarding_completed_date, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, is_active, email_verified, reset_password_token, reset_password_expires, created_at, updated_at, last_login, login_attempts, account_locked_until, email_verification_token, email_verification_expires) FROM stdin;
ce1cd86f-f35d-461f-b79d-13deed894707	Admin User	admin@onboardpro.com	$2b$10$rGZYGxVQYvKjGkzVKJ.QEOu5YHQKVQxVGZQVKJ.QEOu5YHQKVQxVG	admin	EMP001	\N	\N	\N	\N	\N	System Administrator	2026-01-29	\N	not_started	\N	\N	\N	\N	t	t	\N	\N	2026-01-29 18:40:11.302611	2026-01-29 18:40:11.302611	\N	0	\N	\N	\N
8dc2a45e-6e30-4a12-ba5a-de7d0d31de47	Sudesh Kavinda	sudeshkavinda550@gmail.com	$2a$10$R.xY5gr5znjOFVK7zrWrsObGlkW1CgjUXf92IKZ0A26JlcUoWnUgO	employee	EMP2602521	+94775286498	2026-02-01	samagi mawatha, \ndunudambuwewa, \nnochchiyagama.	/uploads/profile-pictures/profile-1772705289390-776029642.jpeg	3dd9fa39-d9d6-4eee-bee5-e444c4534803	Software Engineer	2026-02-06	\N	completed	2026-03-03	Sudesh Kavinda	+94775286490	in	t	f	\N	\N	2026-02-10 21:05:59.351293	2026-04-30 21:51:49.598449	2026-04-30 21:51:49.598449	0	\N	\N	\N
027f119a-2b29-40a9-a0f9-a2849c086e2c	Sudesh Kavinda	sudeshkavinda85@gmail.com	$2a$10$f9oSxWDexw2njx1HCyUnE.g7qx1kACWvZtdG9U./hFDzJF98AMxpG	admin	EMP410623	\N	\N	\N	\N	\N	\N	\N	\N	not_started	\N	\N	\N	\N	t	t	\N	\N	2026-02-17 22:26:50.652499	2026-02-19 19:45:07.848805	2026-02-19 19:45:07.848805	0	\N	\N	\N
24eb81c6-2382-4353-91b8-09e06f8001d2	Sudesh Kavinda	kavindasudesh02@gmail.com	$2a$10$al7lPucFLZRbNe5lwqm8..QIDfDAJGwRK.XS0KlVr2ag4m2RvTTCK	employee	EMP2602772	+94775286498	\N	samagi mawatha\ndunudambuwewa	\N	b1eb6a9c-4816-451d-b382-16f163ff948a	software engineer	2026-02-12	\N	completed	2026-03-06	\N	\N	\N	t	f	\N	\N	2026-02-13 01:17:06.512457	2026-04-30 21:53:18.443976	2026-04-30 21:53:18.443976	0	\N	\N	\N
ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	sudesh kavinda	sudeshkavinda852@gmail.com	$2a$10$HSPdcwm3dz6vT43S.2JxcOGuHYlaU7AZprGVjqmx.GUMTF9XesJq2	hr	EMP809428	\N	\N	\N	\N	\N	\N	\N	\N	not_started	\N	\N	\N	\N	t	t	\N	\N	2026-02-01 19:20:09.444361	2026-04-30 21:54:14.646906	2026-04-30 21:54:14.646906	0	\N	\N	\N
6d80f061-21b9-4a88-9441-5999880476f6	Kamal Perera	kamal@gmail.com	$2a$10$zxS2doO0MZoI.2PRRRcBoeMbXZTulgCz/O6qgB3sgdMskjR6K0P7S	employee	EMP2603960	+94775286498	2000-10-20	samagi mawatha\ndunudambuwewa	/uploads/profile-pictures/profile-1772825217924-710760116.jpeg	cf8dd02b-121a-49e3-aa14-7304d05f7a8d	Software Engineer	2026-03-04	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	completed	2026-03-08	\N	\N	\N	t	f	\N	\N	2026-03-06 18:53:11.510235	2026-03-08 02:24:55.986113	2026-03-08 02:24:55.986113	0	\N	\N	\N
b5cd3a46-f713-4a5d-936b-4cb56e8de6c8	Kavinda Sudesh	sudeshkavinda734@gmail.com	$2a$10$WGSBgwLUepo9Jb5FgG0g3.bhEQIZW4M1KNWuejlfLSiBapDItAuJW	employee	EMP2603933	+94775286498	\N	samagi mawatha,\ndunudambuwewa	\N	1b0965ed-be84-4a4e-ba24-db7c74a25554	Software Engineer	2026-03-07	ecfdb692-825e-4d86-ace4-f4c7f8f51dfd	not_started	\N	\N	\N	\N	t	f	\N	\N	2026-03-08 00:17:13.503912	2026-03-08 00:17:13.503912	\N	0	\N	\N	\N
cfcd33e7-5571-450c-ba4a-85782e0d0c97	sman kumara	saman@gmail.com	$2a$10$FUhSVJq1LBSY8V9U5NIBsOpyBBlNoWPzPkqcgOzbC.5z8PeVU.aAK	admin	EMP142262	\N	\N	\N	\N	\N	\N	\N	\N	not_started	\N	\N	\N	\N	t	t	\N	\N	2026-02-24 07:09:02.271978	2026-02-25 19:59:15.546692	2026-02-25 19:59:15.546692	0	\N	\N	\N
fad54c3b-918b-4f4b-9a85-47f204a7e127	admin	admin@gmail.com	$2a$10$y6pneoAj8HSBZ6btCa0NUuvZjajVcYYKkNEx56NDlMGYwfskAJgtq	admin	EMP553601	\N	\N	\N	\N	\N	\N	\N	\N	not_started	\N	\N	\N	\N	t	t	\N	\N	2026-03-07 14:22:33.602851	2026-03-08 13:33:52.561997	2026-03-08 13:33:52.561997	0	\N	\N	\N
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_tasks employee_tasks_employee_id_task_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_tasks
    ADD CONSTRAINT employee_tasks_employee_id_task_id_key UNIQUE (employee_id, task_id);


--
-- Name: employee_tasks employee_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_tasks
    ADD CONSTRAINT employee_tasks_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_activity_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user ON public.activity_logs USING btree (user_id);


--
-- Name: idx_departments_manager; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_manager ON public.departments USING btree (manager_id);


--
-- Name: idx_documents_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_employee ON public.documents USING btree (employee_id);


--
-- Name: idx_documents_reviewed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_reviewed_by ON public.documents USING btree (reviewed_by);


--
-- Name: idx_documents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_status ON public.documents USING btree (status);


--
-- Name: idx_documents_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_task ON public.documents USING btree (task_id);


--
-- Name: idx_employee_tasks_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_tasks_due_date ON public.employee_tasks USING btree (due_date) WHERE ((status)::text <> 'completed'::text);


--
-- Name: idx_employee_tasks_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_tasks_employee ON public.employee_tasks USING btree (employee_id);


--
-- Name: idx_employee_tasks_employee_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_tasks_employee_due_date ON public.employee_tasks USING btree (employee_id, due_date);


--
-- Name: idx_employee_tasks_employee_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_tasks_employee_status ON public.employee_tasks USING btree (employee_id, status);


--
-- Name: idx_employee_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_tasks_status ON public.employee_tasks USING btree (status);


--
-- Name: idx_employee_tasks_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_tasks_task ON public.employee_tasks USING btree (task_id);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_tasks_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_template ON public.tasks USING btree (template_id);


--
-- Name: idx_tasks_template_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tasks_template_order ON public.tasks USING btree (template_id, order_index);


--
-- Name: idx_templates_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_created_by ON public.templates USING btree (created_by);


--
-- Name: idx_templates_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_department ON public.templates USING btree (department_id);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_department ON public.users USING btree (department_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_employee_id ON public.users USING btree (employee_id);


--
-- Name: idx_users_manager; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_manager ON public.users USING btree (manager_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: departments update_departments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employee_tasks update_employee_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_employee_tasks_updated_at BEFORE UPDATE ON public.employee_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: templates update_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: documents documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: documents documents_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: documents documents_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.employee_tasks(id) ON DELETE SET NULL;


--
-- Name: employee_tasks employee_tasks_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_tasks
    ADD CONSTRAINT employee_tasks_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: employee_tasks employee_tasks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_tasks
    ADD CONSTRAINT employee_tasks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_tasks employee_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_tasks
    ADD CONSTRAINT employee_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: departments fk_departments_manager; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE CASCADE;


--
-- Name: templates templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: templates templates_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Y7mbqgj5X5wK5qwoJtToKjIxPCbfbjwC8RkAhXaW0VgoYnV2KFhF9wsAqsxjxpj

