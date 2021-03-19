create table if not exists block_numbers
(
    id           serial  not null
        constraint block_numbers_pk
            primary key,
    block_number integer not null,
    record_time  integer
);

alter table block_numbers
    owner to postgres;


create table if not exists block_times
(
    id          serial  not null,
    block_id    integer not null
        constraint block_times_block_numbers_id_fk
            references block_numbers
            on update cascade on delete cascade,
    block_time  integer not null,
    record_time integer
);

alter table block_times
    owner to postgres;

create trigger set_timestamp_block_number
    before insert
    on block_numbers
    for each row
execute procedure trigger_set_timestamp();