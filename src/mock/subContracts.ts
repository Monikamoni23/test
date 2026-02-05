import type { SubContract } from "@/types";
import { masterContracts } from "@/mock/contracts";
import { pricingMaster } from "@/mock/pricing";

const pricingLookup = new Map(
  pricingMaster.map((item) => [`${item.gradeId}-${item.countryId}`, item.contractPriceUsdKgs])
);

export const subContracts: SubContract[] = masterContracts.flatMap((contract, index) => {
  const allocation = Math.round(contract.totalContractQuantityKgs / 2);
  const indiaPrice = pricingLookup.get(`${contract.gradeId}-India`) ?? 2.5;
  const vietnamPrice = pricingLookup.get(`${contract.gradeId}-Vietnam`) ?? 2.4;
  const isConfirmed = index % 3 !== 0;

  return [
    {
      id: `${contract.id}-ind`,
      masterContractId: contract.id,
      subContractNumber: `${contract.contractNumber}-IND`,
      countryOfOrigin: "India",
      factory: "Mysuru Co-Op",
      allocatedQtyKgs: allocation,
      contractPriceUsdKgs: indiaPrice,
      subContractValue: allocation * indiaPrice,
      status: "Open",
      isAllocationConfirmed: isConfirmed,
    },
    {
      id: `${contract.id}-vnm`,
      masterContractId: contract.id,
      subContractNumber: `${contract.contractNumber}-VNM`,
      countryOfOrigin: "Vietnam",
      factory: "Da Nang Origin",
      allocatedQtyKgs: contract.totalContractQuantityKgs - allocation,
      contractPriceUsdKgs: vietnamPrice,
      subContractValue: (contract.totalContractQuantityKgs - allocation) * vietnamPrice,
      status: "Open",
      isAllocationConfirmed: isConfirmed,
    },
  ];
});
