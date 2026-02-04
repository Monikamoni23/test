import { AppShell } from "@/components/app-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const buyers = ["Nordic Roasters", "Blue River Coffee", "Atlas Trading"];
const factories = [
  "Mysuru Co-Op",
  "Da Nang Origin",
  "Kerala Beans",
  "Hanoi Harvest",
  "Coorg Estates",
];
const grades = [
  "Arabica G1",
  "Arabica G2",
  "Arabica G3",
  "Robusta G1",
  "Robusta G2",
];
const emails = ["buyer@coffee.com", "ops@buyer.com", "logistics@trading.com"];

export default function MasterDataPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Settings" }, { label: "Master Data" }]} />
        <div>
          <h1 className="text-xl font-semibold">Master Data</h1>
          <p className="text-sm text-muted-foreground">
            Manage reference data used across contract workflows.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { title: "Buyers", items: buyers },
            { title: "Factories", items: factories },
            { title: "Grades", items: grades },
            { title: "Email Recipients", items: emails },
          ].map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <div key={item} className="rounded-md border border-dashed px-3 py-2">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
