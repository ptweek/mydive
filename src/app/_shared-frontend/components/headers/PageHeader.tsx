function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-2 text-white sm:px-0">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-gray-200 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}

export default PageHeader;
