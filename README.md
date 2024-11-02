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

## Note

- This script is currently only meant for email campaigns. Other types of campaigns, such as SMS, will likely encounter issues. Please feel free to contribute to this project if you find yourself scraping other types of campaigns.

## needs fix

- CAB Drip - Brendan
- remove duplicate entries

- brendan one is saved on desktop one
