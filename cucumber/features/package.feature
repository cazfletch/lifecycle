Feature: Package Smart Contract
  Package smart contracts for each of the languages

  Scenario Outline: Package Smart Contract
    Given a '<language>' smart contract of type '<type>'
    When I package the smart contract
    Then a package should exist
    Examples:
    | language   | type   |
    | javascript | node   |
    | typescript | node   |
    | java       | java   |
    | go         | golang |
