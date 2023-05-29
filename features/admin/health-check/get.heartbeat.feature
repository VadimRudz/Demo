@admin_mock @admin_stage
Feature: As a Admin user I want to get heartbeat information

    Scenario: Admin user is able to get heartbeat information
        When user sends "GET" request to "heartbeat" endpoint with "empty" body
        Then user gets response code 200 "OK"
        And user sees "heartbeat" response body

