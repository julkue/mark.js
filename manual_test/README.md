# Why manual test
In the current testing environment, it's not possible to test RegExp group `indices` that why i use jasmine standalone to test specs in standard browsers.

## Use
* Download the jasmine standalone distribution from the [releases page](https://github.com/jasmine/jasmine/releases)
* Extract lib folder in the directory two parents from this one to hide it from version control
If jasmine release number is other than 3.9.0, adjust it in all script references in 'manual_test_regexp_hasIndises.html' file - `<script src="../../lib/jasmine-3.9.0/....js"></script>`.

Fixtures are built-in html file because of browsers:
> Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///.... (Reason: CORS request not http).
