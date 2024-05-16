create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "state_of_incorporation" text,
    "founder_id" uuid
);


alter table "public"."companies" enable row level security;

create table "public"."funds" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "byline" text,
    "investor_id" uuid
);


alter table "public"."funds" enable row level security;

create table "public"."investments" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "founder_id" uuid,
    "company_id" uuid,
    "investor_id" uuid,
    "fund_id" uuid,
    "purchase_amount" text,
    "investment_type" text,
    "valuation_cap" text,
    "discount" text,
    "date" timestamp with time zone,
    "created_by" uuid
);


alter table "public"."investments" enable row level security;

create table "public"."users" (
    "created_at" timestamp with time zone not null default now(),
    "email" text,
    "name" text,
    "updated_at" timestamp without time zone,
    "title" text,
    "id" uuid not null default gen_random_uuid(),
    "auth_id" uuid
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX funds_pkey ON public.funds USING btree (id);

CREATE UNIQUE INDEX investments_pkey ON public.investments USING btree (id);

CREATE UNIQUE INDEX users_auth_id_key ON public.users USING btree (auth_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."funds" add constraint "funds_pkey" PRIMARY KEY using index "funds_pkey";

alter table "public"."investments" add constraint "investments_pkey" PRIMARY KEY using index "investments_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."companies" add constraint "companies_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."companies" validate constraint "companies_founder_id_fkey";

alter table "public"."funds" add constraint "funds_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."funds" validate constraint "funds_investor_id_fkey";

alter table "public"."investments" add constraint "investments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(auth_id) not valid;

alter table "public"."investments" validate constraint "investments_created_by_fkey";

alter table "public"."investments" add constraint "investments_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "investments_founder_id_fkey";

alter table "public"."investments" add constraint "investments_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "investments_investor_id_fkey";

alter table "public"."investments" add constraint "public_investments_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) not valid;

alter table "public"."investments" validate constraint "public_investments_company_id_fkey";

alter table "public"."investments" add constraint "public_investments_fund_id_fkey" FOREIGN KEY (fund_id) REFERENCES funds(id) not valid;

alter table "public"."investments" validate constraint "public_investments_fund_id_fkey";

alter table "public"."users" add constraint "users_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) not valid;

alter table "public"."users" validate constraint "users_auth_id_fkey";

alter table "public"."users" add constraint "users_auth_id_key" UNIQUE using index "users_auth_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public."checkIfUser"(given_mail text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  RETURN (EXISTS (SELECT 1 FROM auth.users a WHERE a.email = given_mail));
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if a user with this email already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = new.email) THEN
    -- Update the existing user's auth_id
    UPDATE public.users
    SET auth_id = new.id,
        updated_at = now()
    WHERE email = new.email;
  ELSE
    -- Insert a new user if no existing user is found
    INSERT INTO public.users (auth_id, email, created_at)
    VALUES (new.id, new.email, now());
  END IF;
  RETURN new;
END;
$function$;

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."funds" to "anon";

grant insert on table "public"."funds" to "anon";

grant references on table "public"."funds" to "anon";

grant select on table "public"."funds" to "anon";

grant trigger on table "public"."funds" to "anon";

grant truncate on table "public"."funds" to "anon";

grant update on table "public"."funds" to "anon";

grant delete on table "public"."funds" to "authenticated";

grant insert on table "public"."funds" to "authenticated";

grant references on table "public"."funds" to "authenticated";

grant select on table "public"."funds" to "authenticated";

grant trigger on table "public"."funds" to "authenticated";

grant truncate on table "public"."funds" to "authenticated";

grant update on table "public"."funds" to "authenticated";

grant delete on table "public"."funds" to "service_role";

grant insert on table "public"."funds" to "service_role";

grant references on table "public"."funds" to "service_role";

grant select on table "public"."funds" to "service_role";

grant trigger on table "public"."funds" to "service_role";

grant truncate on table "public"."funds" to "service_role";

grant update on table "public"."funds" to "service_role";

grant delete on table "public"."investments" to "anon";

grant insert on table "public"."investments" to "anon";

grant references on table "public"."investments" to "anon";

grant select on table "public"."investments" to "anon";

grant trigger on table "public"."investments" to "anon";

grant truncate on table "public"."investments" to "anon";

grant update on table "public"."investments" to "anon";

grant delete on table "public"."investments" to "authenticated";

grant insert on table "public"."investments" to "authenticated";

grant references on table "public"."investments" to "authenticated";

grant select on table "public"."investments" to "authenticated";

grant trigger on table "public"."investments" to "authenticated";

grant truncate on table "public"."investments" to "authenticated";

grant update on table "public"."investments" to "authenticated";

grant delete on table "public"."investments" to "service_role";

grant insert on table "public"."investments" to "service_role";

grant references on table "public"."investments" to "service_role";

grant select on table "public"."investments" to "service_role";

grant trigger on table "public"."investments" to "service_role";

grant truncate on table "public"."investments" to "service_role";

grant update on table "public"."investments" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Authenticated users can insert"
on "public"."companies"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."companies"
as permissive
for select
to authenticated
using (true);


create policy "Investors and founders in investment with fund can delete"
on "public"."companies"
as permissive
for delete
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = companies.founder_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.investor_id)))
  WHERE ((i.company_id = companies.id) AND (u.auth_id = auth.uid()))))));


create policy "Investors and founders in investment with fund can update"
on "public"."companies"
as permissive
for update
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = companies.founder_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.investor_id)))
  WHERE ((i.company_id = companies.id) AND (u.auth_id = auth.uid()))))));


create policy "Authenticated users can insert"
on "public"."funds"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."funds"
as permissive
for select
to authenticated
using (true);


create policy "Founders and investors of investment with company can delete"
on "public"."funds"
as permissive
for delete
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = funds.investor_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.founder_id)))
  WHERE ((i.fund_id = funds.id) AND (u.auth_id = auth.uid()))))));


create policy "Founders and investors of investment with company can update"
on "public"."funds"
as permissive
for update
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = funds.investor_id))) OR (EXISTS ( SELECT 1
   FROM (investments i
     JOIN users u ON ((u.id = i.founder_id)))
  WHERE ((i.fund_id = funds.id) AND (u.auth_id = auth.uid()))))));


create policy "Authenticated users can insert"
on "public"."investments"
as permissive
for insert
to public
with check (true);


create policy "Authenticated users can read"
on "public"."investments"
as permissive
for select
to authenticated
using (true);


create policy "Authenticated users can update"
on "public"."investments"
as permissive
for update
to authenticated
using (true);


create policy "Founders or investors in investment can delete"
on "public"."investments"
as permissive
for delete
to public
using (((auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = investments.founder_id))) OR (auth.uid() = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = investments.investor_id))) OR (auth.uid() IN ( SELECT users.auth_id
   FROM users
  WHERE (users.id IN ( SELECT funds.investor_id
           FROM funds
          WHERE (funds.id = investments.fund_id))))) OR (auth.uid() IN ( SELECT users.auth_id
   FROM users
  WHERE (users.id IN ( SELECT companies.founder_id
           FROM companies
          WHERE (companies.id = investments.company_id)))))));


create policy "Authenticated users can delete themselves"
on "public"."users"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = auth_id));


create policy "Authenticated users can insert"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Authenticated users can read"
on "public"."users"
as permissive
for select
to authenticated
using (true);


create policy "Authenticated users can update themselves"
on "public"."users"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = auth_id));



create type "auth"."one_time_token_type" as enum ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');

create table "auth"."one_time_tokens" (
    "id" uuid not null,
    "user_id" uuid not null,
    "token_type" auth.one_time_token_type not null,
    "token_hash" text not null,
    "relates_to" text not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id);

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);

alter table "auth"."one_time_tokens" add constraint "one_time_tokens_pkey" PRIMARY KEY using index "one_time_tokens_pkey";

alter table "auth"."one_time_tokens" add constraint "one_time_tokens_token_hash_check" CHECK ((char_length(token_hash) > 0)) not valid;

alter table "auth"."one_time_tokens" validate constraint "one_time_tokens_token_hash_check";

alter table "auth"."one_time_tokens" add constraint "one_time_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "auth"."one_time_tokens" validate constraint "one_time_tokens_user_id_fkey";

grant delete on table "auth"."one_time_tokens" to "dashboard_user";

grant insert on table "auth"."one_time_tokens" to "dashboard_user";

grant references on table "auth"."one_time_tokens" to "dashboard_user";

grant select on table "auth"."one_time_tokens" to "dashboard_user";

grant trigger on table "auth"."one_time_tokens" to "dashboard_user";

grant truncate on table "auth"."one_time_tokens" to "dashboard_user";

grant update on table "auth"."one_time_tokens" to "dashboard_user";

grant delete on table "auth"."one_time_tokens" to "postgres";

grant insert on table "auth"."one_time_tokens" to "postgres";

grant references on table "auth"."one_time_tokens" to "postgres";

grant select on table "auth"."one_time_tokens" to "postgres";

grant trigger on table "auth"."one_time_tokens" to "postgres";

grant truncate on table "auth"."one_time_tokens" to "postgres";

grant update on table "auth"."one_time_tokens" to "postgres";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


