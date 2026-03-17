# ./vendor/bin/behat -c tests/Integration/Behaviour/behat.yml -s cart --tags disable-discount-when-customer-or-group-removed
# See https://github.com/PrestaShop/PrestaShop/issues/40109
@disable-discount-when-customer-or-group-removed
@restore-cart-rules-after-scenario
Feature: Disable discount when the only selected customer or customer group is removed
  When the only selected customer or the only selected customer group for a discount is removed,
  the discount must apply to all customers but be disabled so it is no longer applied.

  Background:
    Given groups feature is activated
    And shop configuration for "PS_CART_RULE_FEATURE_ACTIVE" is set to 1
    And the default shop is referenced as "shop1"
    And there is a currency named "usd" with iso code "USD" and exchange rate of 1.0

  Scenario: Discount for a single customer is disabled and applies to all when that customer is deleted
    Given I create a customer "discountCustomer" with following properties:
      | firstName | Jean   |
      | lastName  | Dupont |
      | email     | jean.dupont.discount@prestashop.com |
      | password  | PrestaShopForever1_! |
    And there is a cart rule "discountForCustomer" with following properties:
      | name[en-US]     | Discount for Jean    |
      | discount_amount | 5                     |
      | discount_currency | usd                |
      | code            | CUST_DISCOUNT_40109   |
      | customer        | discountCustomer     |
    When I delete customer "discountCustomer" and allow it to register again
    Then cart rule "discountForCustomer" applies to all customers and is disabled

  Scenario: Discount for only one customer group is disabled and applies to all when that group is deleted
    Given I create a customer group "DiscountGroupA" with the following details:
      | name[en-US]             | Discount Group A |
      | reduction               | 0                |
      | displayPriceTaxExcluded | true             |
      | showPrice               | true             |
      | shopIds                 | shop1            |
    And there is a cart rule "discountForGroupA" with following properties:
      | name[en-US]     | Discount for Group A |
      | discount_amount | 10                   |
      | discount_currency | usd               |
      | code            | GROUP_A_DISCOUNT_40109 |
      | groups          | DiscountGroupA       |
    When I delete customer group "DiscountGroupA"
    Then cart rule "discountForGroupA" applies to all customers and is disabled

  Scenario: Discount for two customer groups stays enabled and applies only to remaining group when one group is deleted
    Given I create a customer group "DiscountGroupB" with the following details:
      | name[en-US]             | Discount Group B |
      | reduction               | 0                |
      | displayPriceTaxExcluded | true             |
      | showPrice               | true             |
      | shopIds                 | shop1            |
    And I create a customer group "DiscountGroupC" with the following details:
      | name[en-US]             | Discount Group C |
      | reduction               | 0                |
      | displayPriceTaxExcluded | true             |
      | showPrice               | true             |
      | shopIds                 | shop1            |
    And there is a cart rule "discountForGroupBOrC" with following properties:
      | name[en-US]     | Discount for Group B or C |
      | discount_amount | 15                       |
      | discount_currency | usd                   |
      | code            | GROUP_BC_DISCOUNT_40109  |
      | groups          | DiscountGroupB,DiscountGroupC |
    When I delete customer group "DiscountGroupB"
    Then cart rule "discountForGroupBOrC" is enabled and applies only to group "DiscountGroupC"

  Scenario: Discount for a customer group is disabled and applies to all when Customer groups feature is disabled
    Given I create a customer group "DiscountGroupD" with the following details:
      | name[en-US]             | Discount Group D |
      | reduction               | 0                |
      | displayPriceTaxExcluded | true             |
      | showPrice               | true             |
      | shopIds                 | shop1            |
    And there is a cart rule "discountForGroupD" with following properties:
      | name[en-US]     | Discount for Group D |
      | discount_amount | 20                   |
      | discount_currency | usd               |
      | code            | GROUP_D_DISCOUNT_40109 |
      | groups          | DiscountGroupD       |
    And groups feature is deactivated
    Then cart rule "discountForGroupD" applies to all customers and is disabled
