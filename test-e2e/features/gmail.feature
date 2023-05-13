Feature: Gmail

  Scenario: Wait for email
    When I log in to gmail as '$user'
    And I wait email matching 'subject:custom subject after:2020/01/01'
    And I save email matching 'subject:custom subject' as 'email'
    And I expect '$email.subject' memory value to be equal 'custom subject'
