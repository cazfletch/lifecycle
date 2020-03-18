Feature: Install Smart Contract
  Install packaged smart contracts on a peer

  Scenario Outline: Install Packaged Smart Contract
    Given a '<language>' smart contract of type '<type>'
    And the package exists
    And the gateway is connected
    And the lifecycle is setup
    When I install the smart contract
    Then the package should be installed on the peer
    Examples:
      | language   | type   |
      | javascript | node   |
      | typescript | node   |
      | java       | java   |
      | go         | golang |
