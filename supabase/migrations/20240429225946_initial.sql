create table "public"."companies" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "state_of_incorporation" text,
    "founder_id" uuid
);


create table "public"."funds" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "street" text,
    "city_state_zip" text,
    "byline" text,
    "investor_id" uuid
);


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


create table "public"."users" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "email" text,
    "name" text,
    "updated_at" timestamp without time zone,
    "title" text,
    "type" text
);


CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX funds_pkey ON public.funds USING btree (id);

CREATE UNIQUE INDEX investments_pkey ON public.investments USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."funds" add constraint "funds_pkey" PRIMARY KEY using index "funds_pkey";

alter table "public"."investments" add constraint "investments_pkey" PRIMARY KEY using index "investments_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."companies" add constraint "public_companies_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."companies" validate constraint "public_companies_founder_id_fkey";

alter table "public"."funds" add constraint "public_funds_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."funds" validate constraint "public_funds_investor_id_fkey";

alter table "public"."investments" add constraint "public_investments_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) not valid;

alter table "public"."investments" validate constraint "public_investments_company_id_fkey";

alter table "public"."investments" add constraint "public_investments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "public_investments_created_by_fkey";

alter table "public"."investments" add constraint "public_investments_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "public_investments_founder_id_fkey";

alter table "public"."investments" add constraint "public_investments_fund_id_fkey" FOREIGN KEY (fund_id) REFERENCES funds(id) not valid;

alter table "public"."investments" validate constraint "public_investments_fund_id_fkey";

alter table "public"."investments" add constraint "public_investments_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES users(id) not valid;

alter table "public"."investments" validate constraint "public_investments_investor_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

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
begin
  insert into public.accounts (id, email)
  values (new.id, new.email);
  return new;
end;
$function$
;

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


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

