# Gig Pack Checklist

Build a clean, modern mobile-first web app called "GigList".

The app is a checklist for musicians preparing equipment for live performances.

CORE USER FLOW:

The home screen shows a list of the user's upcoming gigs.

The user can create a new gig.

When creating a gig, the user enters:

Gig name

Date

After creating a gig, the user sees an equipment checklist.

Each equipment item has a checkbox.

The user can:

Check/uncheck an item

Add a new equipment item

Edit an item's name

Delete an item

Reorder items

Show a clear progress indicator, for example:
"7 / 12 packed"

When all items are checked, show a satisfying completed state.

DEFAULT EQUIPMENT ITEMS FOR A NEW GIG:

Piano

Laptop

Audio interface

iPad

Laptop stand

Music stand

Guitar

Stereo TRS/PL cable

USB cable

Power supply

Sustain pedal

Extension cable

TEMPLATES:

Allow the user to create a gig from a template.

Include these initial templates:

"Piano + Laptop"
"Guitar"
"Full Setup"

Each template contains an appropriate predefined equipment checklist.

DESIGN:

Mobile-first

Very clean and modern

Designed primarily for use on a phone

Large touch-friendly buttons

Minimal interface

Dark text on a light background

Use subtle animations when checking items

Make the checklist extremely easy to use while the user is physically packing equipment

Avoid unnecessary complexity

HOME SCREEN:

Show:

App name: GigList

"Upcoming gigs"

Gig cards showing gig name, date, and packing progress

Large "+ New Gig" button

GIG SCREEN:

Show:

Gig name

Date

Progress (e.g. 7/12 packed)

Progress bar

Checklist

"+ Add item" button

DATA:

Persist the user's gigs and checklist items so that refreshing the page does not erase them.

For this first version, keep the app simple. Do not add authentication, payments, social features, or unnecessary backend complexity.

Make the application fully functional rather than just creating a visual mockup.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fedcbb42-f063-4c71-bd05-eae6327edaa8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
