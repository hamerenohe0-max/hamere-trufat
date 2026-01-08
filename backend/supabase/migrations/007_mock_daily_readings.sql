-- Insert Mock Data for TODAY (Morning and Evening)

-- Morning Reading
INSERT INTO daily_readings (
    date, time_of_day, 
    gospel_geez, gospel_amharic, gospel_ref,
    epistle_geez, epistle_amharic, epistle_ref,
    acts_geez, acts_amharic, acts_ref,
    psalm_geez, psalm_amharic, psalm_ref
) VALUES (
    CURRENT_DATE, 
    'Morning',
    'ወይቤሎሙ እግዚእ ኢየሱስ ለይሁዳውያን... (Geez Gospel)', 
    'Jesus said to the Jews... (Amharic Gospel)', 
    'Matthew 5:1-12',
    
    'ወንጌለ ማርቆስ... (Geez Epistle)', 
    'The Gospel of Mark... (Amharic Epistle)', 
    'Romans 1:1-7',
    
    'ግብረ ሐዋርያት... (Geez Acts)', 
    'Acts of the Apostles... (Amharic Acts)', 
    'Acts 2:1-4',
    
    'መዝሙር ዳዊት... (Geez Psalms)', 
    'The Psalms of David... (Amharic Psalms)', 
    'Psalms 23'
) ON CONFLICT (date, time_of_day) DO NOTHING;

-- Evening Reading
INSERT INTO daily_readings (
    date, time_of_day, 
    gospel_geez, gospel_amharic, gospel_ref,
    epistle_geez, epistle_amharic, epistle_ref,
    acts_geez, acts_amharic, acts_ref,
    psalm_geez, psalm_amharic, psalm_ref
) VALUES (
    CURRENT_DATE, 
    'Evening',
    'ወይቤሎሙ በጽባሕ... (Geez Evening Gospel)', 
    'And he said to them in the morning... (Amharic Evening Gospel)', 
    'Luke 24:1-12',
    
    'መልእክተ ጳውሎስ... (Geez Evening Epistle)', 
    'The Epistle of Paul... (Amharic Evening Epistle)', 
    '1 Corinthians 13:1-13',
    
    'ግብረ ሐዋርያት ምዕራፍ... (Geez Evening Acts)', 
    'Acts Chapter... (Amharic Evening Acts)', 
    'Acts 9:1-19',
    
    'መዝሙር ዘነግህ... (Geez Evening Psalms)', 
    'Morning Psalms... (Amharic Evening Psalms)', 
    'Psalms 91'
) ON CONFLICT (date, time_of_day) DO NOTHING;
