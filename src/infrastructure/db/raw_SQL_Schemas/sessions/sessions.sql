PGDMP  !            	    	    {            social-network    16rc1    16.0 (Homebrew) 	               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                        0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            !           1262    16398    social-network    DATABASE     r   CREATE DATABASE "social-network" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
     DROP DATABASE "social-network";
                postgres    false                        2615    16552    devices    SCHEMA        CREATE SCHEMA devices;
    DROP SCHEMA devices;
                postgres    false            �            1259    16553    sessions    TABLE     -  CREATE TABLE devices.sessions (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    title character varying NOT NULL,
    ip character varying NOT NULL,
    "lastActiveDate" timestamp with time zone NOT NULL,
    "expirationDate" timestamp with time zone NOT NULL,
    "issuedAt" bigint NOT NULL
);
    DROP TABLE devices.sessions;
       devices         heap    postgres    false    6            �           2606    16559    sessions sessions_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY devices.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
 A   ALTER TABLE ONLY devices.sessions DROP CONSTRAINT sessions_pkey;
       devices            postgres    false    220            �           1259    16565 
   fki_userId    INDEX     F   CREATE INDEX "fki_userId" ON devices.sessions USING btree ("userId");
 !   DROP INDEX devices."fki_userId";
       devices            postgres    false    220            �           2606    16560    sessions userId    FK CONSTRAINT     �   ALTER TABLE ONLY devices.sessions
    ADD CONSTRAINT "userId" FOREIGN KEY ("userId") REFERENCES "user"."accountData"(id) NOT VALID;
 <   ALTER TABLE ONLY devices.sessions DROP CONSTRAINT "userId";
       devices          postgres    false    220           