SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.5 (Ubuntu 15.5-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '4b378427-fc64-4c10-8f94-3eb18a073d00', '{"action":"user_confirmation_requested","actor_id":"70c08f1e-a88e-42c2-ad43-a5dc69f1907a","actor_username":"foo@bar.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-04-28 17:39:45.44481+00', ''),
	('00000000-0000-0000-0000-000000000000', '972edcca-1d82-4832-8cea-0fcd18f94e78', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"foo@bar.com","user_id":"70c08f1e-a88e-42c2-ad43-a5dc69f1907a","user_phone":""}}', '2024-04-28 17:40:26.841276+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f606b1b-7c3c-434c-b363-7c795f43414c', '{"action":"user_confirmation_requested","actor_id":"8d128fc7-df5e-4fa0-9063-2b91b0ef64ea","actor_username":"alana@basecase.vc","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-04-28 17:48:07.939864+00', ''),
	('00000000-0000-0000-0000-000000000000', '9eb1dbbc-9157-4912-b14b-c16004a07d35', '{"action":"user_signedup","actor_id":"8d128fc7-df5e-4fa0-9063-2b91b0ef64ea","actor_username":"alana@basecase.vc","actor_via_sso":false,"log_type":"team"}', '2024-04-28 17:48:18.84072+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") VALUES
	('58dbcfc3-b1b6-4e13-b37a-82d85a4989ed', '70c08f1e-a88e-42c2-ad43-a5dc69f1907a', '4f3bbc50-52d7-4e45-8eee-1becff3dd020', 's256', 'dnTP78mILZcXQTI1_gBA-czKnPiVsvKJDjhssvO-w1I', 'email', '', '', '2024-04-28 17:39:45.448825+00', '2024-04-28 17:39:45.448825+00', 'email/signup', NULL),
	('9da5e0aa-6878-49c6-a498-c84afd0fe949', '8d128fc7-df5e-4fa0-9063-2b91b0ef64ea', '335f8002-0520-43a3-8978-3f6d1f168605', 's256', 'W-CCryYyLUe1-OpgOFkeTDPMXNagvqx1O9WgrSM4T_8', 'email', '', '', '2024-04-28 17:48:07.940459+00', '2024-04-28 17:48:18.844297+00', 'email/signup', '2024-04-28 17:48:18.844242+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '8d128fc7-df5e-4fa0-9063-2b91b0ef64ea', 'authenticated', 'authenticated', 'alana@basecase.vc', '$2a$10$qG7WhFyRYkwP81oRhdDP9O0FjGOsiPrIjgxHklCDCC6l9RkNm3A3G', '2024-04-28 17:48:18.841258+00', NULL, '', '2024-04-28 17:48:07.940982+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "8d128fc7-df5e-4fa0-9063-2b91b0ef64ea", "email": "alana@basecase.vc", "email_verified": false, "phone_verified": false}', NULL, '2024-04-28 17:48:07.933766+00', '2024-04-28 17:48:18.842526+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('8d128fc7-df5e-4fa0-9063-2b91b0ef64ea', '8d128fc7-df5e-4fa0-9063-2b91b0ef64ea', '{"sub": "8d128fc7-df5e-4fa0-9063-2b91b0ef64ea", "email": "alana@basecase.vc", "email_verified": false, "phone_verified": false}', 'email', '2024-04-28 17:48:07.937692+00', '2024-04-28 17:48:07.937737+00', '2024-04-28 17:48:07.937737+00', 'b7989e4d-4edf-4a2a-9b07-c8e0ff78e870');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."accounts" ("id", "created_at", "email", "name", "updated_at") VALUES
	('8d128fc7-df5e-4fa0-9063-2b91b0ef64ea', '2024-04-28 17:48:07.933383+00', 'alana@basecase.vc', NULL, NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
