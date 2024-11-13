# scrape-insuredmine

Script to scrape insuredmine engagement data.

## Usage

1. Create a `.env` file in the root directory with the following variables:

```bash
  
  INSUREDMINE_EMAIL=your_email@example.com
  INSUREDMINE_PASSWORD=your_password

```

2. Run the script:

```bash

  # using x86 architecture
  npm run dev

  # using ARM64 architecture
  docker compose up --build

```

## Output

The script will output a csv file with data about each engagement and drip campaign.
