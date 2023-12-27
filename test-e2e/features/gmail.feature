Feature: Gmail

  Scenario: Wait for email
    When I log in to gmail as '$user'
    And I wait email matching 'subject:do not delete'
    And I save email matching 'subject:do not delete' as 'email'
    And I expect '$email.subject' memory value to be equal 'DO NOT DELETE'

  Scenario: Mark email as read
    When I log in to gmail as '$user'
    And I wait email matching 'subject:do not delete is:unread'
    And I remove "UNREAD" label to email matching 'subject:do not delete'
    Then I wait email matching 'subject:do not delete is:read'
    And I add "UNREAD" label to email matching 'subject:do not delete'
