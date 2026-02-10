<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

namespace PrestaShop\PrestaShop\Core\Domain\Shipment\QueryResult;

/**
 * Represents a shipment with its associated products (order details) IDs
 */
class OrderShipmentWithProducts
{
    /**
     * @var int
     */
    private int $shipmentId;

    /**
     * @var int[] Array of order detail IDs
     */
    private array $orderDetailIds;

    /**
     * @var string
     */
    private string $carrierName;

    /**
     * @var string|null
     */
    private ?string $trackingNumber;

    /**
     * @param int $shipmentId
     * @param int[] $orderDetailIds Array of order detail IDs belonging to this shipment
     * @param string $carrierName
     * @param string|null $trackingNumber
     */
    public function __construct(
        int $shipmentId,
        array $orderDetailIds,
        string $carrierName,
        ?string $trackingNumber
    ) {
        $this->shipmentId = $shipmentId;
        $this->orderDetailIds = $orderDetailIds;
        $this->carrierName = $carrierName;
        $this->trackingNumber = $trackingNumber;
    }

    /**
     * @return int
     */
    public function getShipmentId(): int
    {
        return $this->shipmentId;
    }

    /**
     * @return int[] Array of order detail IDs
     */
    public function getOrderDetailIds(): array
    {
        return $this->orderDetailIds;
    }

    /**
     * @return string
     */
    public function getCarrierName(): string
    {
        return $this->carrierName;
    }

    /**
     * @return string|null
     */
    public function getTrackingNumber(): ?string
    {
        return $this->trackingNumber;
    }

    /**
     * Convert to array format for easy template usage.
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'shipmentId' => $this->shipmentId,
            'orderDetailIds' => $this->orderDetailIds,
            'carrierName' => $this->carrierName,
            'trackingNumber' => $this->trackingNumber,
        ];
    }
}
