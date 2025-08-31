# IoT Events Table API Reference

The `iot_events` table stores telemetry data from various IoT devices including sensors and monitoring equipment.

## Table Structure

| Column Name | Data Type | Format | Description |
|-------------|-----------|---------|-------------|
| `id` | bigint | number | Auto-incrementing primary key |
| `device_id` | text | string | Unique identifier for the IoT device |
| `type` | text | string | Sensor type: 'temperature', 'door', 'card', 'humidity', 'motion', 'smoke' |
| `value` | numeric | number | Sensor reading value |
| `status` | text | string | Device status information |
| `metadata` | jsonb | json | Additional structured data |
| `created_at` | timestamp with time zone | string | Record creation timestamp |

## Read Rows

*Documentation: [Supabase Select Guide](https://supabase.com/docs/reference/javascript/select)*

To read rows in this table, use the select method.

### Read All Rows

```javascript
let { data: iot_events, error } = await supabase
  .from('iot_events')
  .select('*')
```

### Read Specific Columns

```javascript
let { data: iot_events, error } = await supabase
  .from('iot_events')
  .select('some_column,other_column')
```

### Read Referenced Tables

```javascript
let { data: iot_events, error } = await supabase
  .from('iot_events')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
```

### With Pagination

```javascript
let { data: iot_events, error } = await supabase
  .from('iot_events')
  .select('*')
  .range(0, 9)
```

## Filtering

*Documentation: [Supabase Filters Guide](https://supabase.com/docs/reference/javascript/using-filters)*

Supabase provides a wide range of filters:

### With Filtering

```javascript
let { data: iot_events, error } = await supabase
  .from('iot_events')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
```

## Insert Rows

*Documentation: [Supabase Insert Guide](https://supabase.com/docs/reference/javascript/insert)*

`insert` lets you insert into your tables. You can also insert in bulk and do UPSERT.

`insert` will also return the replaced values for UPSERT.

### Insert a Row

```javascript
const { data, error } = await supabase
  .from('iot_events')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
```

### Insert Many Rows

```javascript
const { data, error } = await supabase
  .from('iot_events')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
```

### Upsert Matching Rows

```javascript
const { data, error } = await supabase
  .from('iot_events')
  .upsert({ some_column: 'someValue' })
  .select()
```

## Update Rows

*Documentation: [Supabase Update Guide](https://supabase.com/docs/reference/javascript/update)*

`update` lets you update rows. `update` will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

`update` will also return the replaced values for UPDATE.

### Update Matching Rows

```javascript
const { data, error } = await supabase
  .from('iot_events')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
```

## Delete Rows

*Documentation: [Supabase Delete Guide](https://supabase.com/docs/reference/javascript/delete)*

`delete` lets you delete rows. `delete` will match all rows by default, so remember to specify your filters!

### Delete Matching Rows

```javascript
const { error } = await supabase
  .from('iot_events')
  .delete()
  .eq('some_column', 'someValue')
```

## Subscribe to Changes

*Documentation: [Supabase Realtime Guide](https://supabase.com/docs/reference/javascript/subscribe)*

Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

### Subscribe to All Events

```javascript
const channels = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'iot_events' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Inserts

```javascript
const channels = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'iot_events' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Updates

```javascript
const channels = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'iot_events' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Deletes

```javascript
const channels = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'iot_events' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to Specific Rows

```javascript
const channels = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'iot_events', filter: 'some_column=eq.some_value' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```