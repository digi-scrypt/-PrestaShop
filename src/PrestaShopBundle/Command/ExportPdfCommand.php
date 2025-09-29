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

declare(strict_types=1);

namespace PrestaShopBundle\Command;

use DateTime;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Export PDF documents command
 */
class ExportPdfCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    public function configure()
    {
        $this
            ->setName('prestashop:pdf:export')
            ->setDescription('Exports a PDF document')
            ->addArgument('from', InputArgument::REQUIRED, 'From date')
            ->addArgument('to', InputArgument::REQUIRED, 'To date')
            ->addOption('type', 't', InputOption::VALUE_OPTIONAL, 'Type', 'invoice')
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $from = $input->getArgument('from');
        $to = $input->getArgument('to');

        $dataProvider = $this->getDataProvider($input->getOption('type'));

        // Get collection by submitted date interval
        $objectCollection = $dataProvider->getByDateInterval(
            new DateTime($from),
            new DateTime($to)
        );

        if (null === $objectCollection || count($objectCollection) === 0) {
            $output->writeln('<error>No datas found for the given date range.</error>');

            return 1;
        }

        $pdfGenerator = $this->getPdfGenerator($input->getOption('type'));

        // Generate PDF out of found objects
        $pdfGenerator->generatePDF($objectCollection, 'F', _PS_PDF_DIR_ . 'export/invoices.pdf');

        return 0;
    }

    protected function getDataProvider(string $type = 'invoice')
    {
        switch ($type) {
            case 'invoice':
                return $this->getContainer()->get('prestashop.adapter.data_provider.order_invoice');
            default:
                throw new \InvalidArgumentException(sprintf('The type "%s" is not supported.', $type));
        }
    }

    protected function getPdfGenerator(string $type = 'invoice')
    {
        switch ($type) {
            case 'invoice':
                return $this->getContainer()->get('prestashop.adapter.pdf.generator.invoice');
            default:
                throw new \InvalidArgumentException(sprintf('The type "%s" is not supported.', $type));
        }
    }
}
