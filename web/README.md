# Kolabo
A free, open source collaborative text editor made from scratch without any external CRDT libraries.

## Features
- Log in and invite users to your document
- Live collaborate on shared content
- Manage permissions: viewer or editor
- [coming soon] Document state saving to cloud
- [coming soon] Invite people without an account to view or edit your document
- [coming soon] Live caret position for users

## Motivation
After reading the *Designing Data-Intensive Applications* book (by the way a really good one), I wanted to extend my portfolio with a good project utilizing commonly used technologies and some advanced algorithms for optimization. 

## Challenges
1. Race conditions with updating DOM: When creating the base web editor, I had to manage incoming edit operations. However, I came across a huge issue with race conditions - the message was processed by the WS but even though the function call was there - it wasn't invoked. Suprisingly, adding a few `console.log`'s magically fixed the issue. But I didn't want it that way, polluting the console with random trash just for the system to barely work