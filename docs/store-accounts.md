# Store accounts: what Jay needs to set up before the phone apps (B-ACCT)

Phone builds (B-CI) and TestFlight / Play testing (B-BETAREV) can't start until these accounts exist. This page lists the steps in order. Checked against Apple's and Google's help pages on Nov 22, 2026; the rules change, so the account sites have the final word.

## First decision: whose name goes on the app

The store shows the account's legal name as the app's seller. There are two choices:

- **An organization account** (a business such as Tarnished Labs, or Action Zone's company). This is the better fit, because the game is part of DojoForge and other schools will use it. It needs a **D-U-N-S Number** (free) and takes longer to verify.
- **A personal account** in Jay's name. It's quicker to open, but Google makes new personal accounts run a closed test with **12 testers for 14 days in a row** before the app can go public. Organization accounts don't have to.

**Talk to Nic first:** Tarnished Labs is the natural owner if DojoForge will carry the game for other schools.

## Step 1: D-U-N-S Number (organization accounts only)

1. Look the business up on Apple's D-U-N-S page (developer.apple.com/support/D-U-N-S). It may already have one.
2. If it doesn't, request one there. It's free. Dun & Bradstreet takes up to about 5 business days, and Apple up to 2 more to see it.
3. Have the business's registration papers ready; D&B may call to check.

## Step 2: Apple Developer Program ($99 a year)

You'll need:

- an Apple Account with two-factor sign-in turned on
- for an organization: the D-U-N-S Number, the legal business name, a work email on the business's own website domain, and a public website on that domain

Steps:

1. Go to developer.apple.com/programs/enroll and choose individual or organization.
2. Fill in the details. Apple checks them, which can take a while for organizations.
3. When Apple emails you, accept the agreement and pay.

## Step 3: Google Play Console ($25 once)

1. Go to play.google.com/console and sign up with the account type you chose in the first decision.
2. Pay the fee and finish the identity check. An organization account also asks for the D-U-N-S Number.
3. Later, Claude sets the app up in the Families program (it's for kids).

## Step 4: let the builds publish (Claude explains each click when we get here)

- **Apple:** an App Store Connect API key, created in App Store Connect › Users and Access › Integrations.
- **Google:** a service account key, created in Play Console › Setup › API access.
- Jay pastes both into the repository's **GitHub Secrets** himself (Settings › Secrets and variables › Actions). **Never paste keys or passwords into the chat.**

With those in place, B-CI builds the iPhone app on GitHub's Mac computers (Jay has no Mac) and the Android app, and sends test builds to TestFlight and Play testing.
